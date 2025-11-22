/*!
 * AllergenMatcher - Intelligent allergen matching engine
 *
 * Uses fuzzy matching and similarity scoring to detect allergens
 * Handles misspellings, variations, and cross-reactions
 */

use crate::{
    allergen_db::AllergenDatabase,
    parser::Ingredient,
    AllergyProfile, AllergenMatch,
};

pub struct AllergenMatcher {
    db: AllergenDatabase,
}

impl AllergenMatcher {
    pub fn new() -> Self {
        Self {
            db: AllergenDatabase::new(),
        }
    }

    /// Find allergens in ingredients based on user profile
    pub fn find_allergens(
        &self,
        ingredients: &[Ingredient],
        profile: &AllergyProfile,
    ) -> Vec<AllergenMatch> {
        let mut matches = Vec::new();

        for ingredient in ingredients {
            // Check against each allergy in profile
            for allergy in &profile.allergies {
                if self.is_match(&ingredient.normalized_name, &allergy.name, &allergy.aliases) {
                    matches.push(AllergenMatch {
                        allergen: allergy.name.clone(),
                        severity: allergy.severity,
                        confidence: self.calculate_confidence(&ingredient.normalized_name, &allergy.name),
                    });
                }

                // Check aliases
                for alias in &allergy.aliases {
                    if self.is_match(&ingredient.normalized_name, alias, &[]) {
                        matches.push(AllergenMatch {
                            allergen: allergy.name.clone(),
                            severity: allergy.severity,
                            confidence: self.calculate_confidence(&ingredient.normalized_name, alias),
                        });
                    }
                }
            }

            // Check database for additional allergens
            let db_matches = self.db.contains_allergen(&ingredient.normalized_name);
            for allergen_info in db_matches {
                // Only add if user has this allergy
                if profile.allergies.iter().any(|a| a.name == allergen_info.name) {
                    // Already added above
                    continue;
                }

                // Check cross-reactions
                for cross in &allergen_info.cross_reactions {
                    if profile.allergies.iter().any(|a| a.name == *cross) {
                        if let Some(user_allergy) = profile.allergies.iter().find(|a| a.name == *cross) {
                            matches.push(AllergenMatch {
                                allergen: format!("{} (cross-reactive with {})", allergen_info.name, cross),
                                severity: user_allergy.severity,
                                confidence: 0.8, // Lower confidence for cross-reactions
                            });
                        }
                    }
                }
            }
        }

        // Deduplicate matches
        self.deduplicate_matches(matches)
    }

    /// Check if ingredient name matches allergen
    fn is_match(&self, ingredient: &str, allergen: &str, aliases: &[String]) -> bool {
        let ingredient_lower = ingredient.to_lowercase();
        let allergen_lower = allergen.to_lowercase();

        // Exact match
        if ingredient_lower.contains(&allergen_lower) {
            return true;
        }

        // Check aliases
        for alias in aliases {
            if ingredient_lower.contains(&alias.to_lowercase()) {
                return true;
            }
        }

        // Fuzzy match (Levenshtein distance)
        if self.fuzzy_match(&ingredient_lower, &allergen_lower, 2) {
            return true;
        }

        false
    }

    /// Simple fuzzy matching using edit distance
    fn fuzzy_match(&self, s1: &str, s2: &str, max_distance: usize) -> bool {
        // Only use fuzzy matching for similar-length strings
        let len_diff = (s1.len() as isize - s2.len() as isize).abs() as usize;
        if len_diff > max_distance {
            return false;
        }

        self.levenshtein_distance(s1, s2) <= max_distance
    }

    /// Calculate Levenshtein distance (edit distance)
    fn levenshtein_distance(&self, s1: &str, s2: &str) -> usize {
        let len1 = s1.chars().count();
        let len2 = s2.chars().count();

        let mut matrix = vec![vec![0; len2 + 1]; len1 + 1];

        for i in 0..=len1 {
            matrix[i][0] = i;
        }
        for j in 0..=len2 {
            matrix[0][j] = j;
        }

        let s1_chars: Vec<char> = s1.chars().collect();
        let s2_chars: Vec<char> = s2.chars().collect();

        for i in 1..=len1 {
            for j in 1..=len2 {
                let cost = if s1_chars[i - 1] == s2_chars[j - 1] { 0 } else { 1 };
                matrix[i][j] = std::cmp::min(
                    std::cmp::min(
                        matrix[i - 1][j] + 1,      // deletion
                        matrix[i][j - 1] + 1       // insertion
                    ),
                    matrix[i - 1][j - 1] + cost    // substitution
                );
            }
        }

        matrix[len1][len2]
    }

    /// Calculate confidence score (0.0 - 1.0)
    fn calculate_confidence(&self, ingredient: &str, allergen: &str) -> f32 {
        let ingredient_lower = ingredient.to_lowercase();
        let allergen_lower = allergen.to_lowercase();

        // Exact substring match = 1.0
        if ingredient_lower == allergen_lower {
            return 1.0;
        }

        if ingredient_lower.contains(&allergen_lower) {
            return 0.95;
        }

        // Fuzzy match = 0.7-0.9 based on distance
        let distance = self.levenshtein_distance(&ingredient_lower, &allergen_lower);
        let max_len = std::cmp::max(ingredient.len(), allergen.len());

        if distance == 0 {
            1.0
        } else {
            let similarity = 1.0 - (distance as f32 / max_len as f32);
            (similarity * 0.9).max(0.5) // Min confidence 0.5 for matches
        }
    }

    fn deduplicate_matches(&self, matches: Vec<AllergenMatch>) -> Vec<AllergenMatch> {
        let mut deduped: Vec<AllergenMatch> = Vec::new();

        for m in matches {
            if !deduped.iter().any(|existing| existing.allergen == m.allergen) {
                deduped.push(m);
            } else {
                // Update with higher confidence
                if let Some(existing) = deduped.iter_mut().find(|e| e.allergen == m.allergen) {
                    if m.confidence > existing.confidence {
                        *existing = m;
                    }
                }
            }
        }

        deduped
    }
}

impl Default for AllergenMatcher {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Allergy, AllergyProfile};

    #[test]
    fn test_exact_match() {
        let matcher = AllergenMatcher::new();
        assert!(matcher.is_match("contains peanuts", "peanut", &[]));
    }

    #[test]
    fn test_fuzzy_match() {
        let matcher = AllergenMatcher::new();
        // "peanut" vs "peanit" (1 edit)
        assert!(matcher.fuzzy_match("peanut", "peanit", 2));
    }

    #[test]
    fn test_confidence_calculation() {
        let matcher = AllergenMatcher::new();
        let confidence = matcher.calculate_confidence("peanuts", "peanut");
        assert!(confidence > 0.9);
    }

    #[test]
    fn test_find_allergens() {
        let matcher = AllergenMatcher::new();
        let parser = crate::parser::IngredientParser::new();
        let ingredients = parser.parse("wheat flour, milk, eggs");

        let mut profile = AllergyProfile::new("test".to_string());
        profile.allergies.push(Allergy {
            name: "milk".to_string(),
            severity: SeverityLevel::Moderate,
            aliases: vec![],
        });

        let matches = matcher.find_allergens(&ingredients, &profile);
        assert!(!matches.is_empty());
    }
}
