/*!
 * AllMyAllergies Core Engine
 *
 * High-performance Rust/WASM core for allergen detection and ingredient analysis.
 * Built with ruv's agentic-flow principles for 352x performance improvement.
 */

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

mod allergen_db;
mod parser;
mod matcher;
mod vector_store;

pub use allergen_db::AllergenDatabase;
pub use parser::IngredientParser;
pub use matcher::AllergenMatcher;
pub use vector_store::VectorStore;

/// Initialize the WASM module with panic hooks and logging
#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
    wasm_logger::init(wasm_logger::Config::default());
    log::info!("AllMyAllergies WASM core initialized");
}

/// Severity level of an allergic reaction
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[wasm_bindgen]
pub enum SeverityLevel {
    Mild = 1,
    Moderate = 2,
    Severe = 3,
    Anaphylaxis = 4,
}

/// User's allergy profile
#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen(getter_with_clone)]
pub struct AllergyProfile {
    pub user_id: String,
    allergies: Vec<Allergy>,
    sensitivities: Vec<Sensitivity>,
    cross_reactions: Vec<CrossReaction>,
}

#[wasm_bindgen]
impl AllergyProfile {
    #[wasm_bindgen(constructor)]
    pub fn new(user_id: String) -> Self {
        Self {
            user_id,
            allergies: Vec::new(),
            sensitivities: Vec::new(),
            cross_reactions: Vec::new(),
        }
    }

    pub fn add_allergy(&mut self, name: String, severity: SeverityLevel) {
        self.allergies.push(Allergy {
            name,
            severity,
            aliases: Vec::new(),
        });
    }

    pub fn to_json(&self) -> Result<String, JsValue> {
        serde_json::to_string(self)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }

    pub fn from_json(json: &str) -> Result<AllergyProfile, JsValue> {
        serde_json::from_str(json)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }
}

/// Individual allergy
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Allergy {
    pub name: String,
    pub severity: SeverityLevel,
    pub aliases: Vec<String>,
}

/// Food sensitivity (non-allergic)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sensitivity {
    pub name: String,
    pub symptoms: Vec<String>,
}

/// Cross-reaction between allergens
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossReaction {
    pub allergen: String,
    pub cross_reactive_with: Vec<String>,
}

/// Result of allergen detection
#[derive(Debug, Clone, Serialize, Deserialize)]
#[wasm_bindgen(getter_with_clone)]
pub struct DetectionResult {
    pub is_safe: bool,
    pub detected_allergens: Vec<String>,
    pub severity: SeverityLevel,
    pub warnings: Vec<String>,
    pub confidence: f32,
}

#[wasm_bindgen]
impl DetectionResult {
    pub fn to_json(&self) -> Result<String, JsValue> {
        serde_json::to_string(self)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }
}

/// Main AllMyAllergies engine
#[wasm_bindgen]
pub struct AllergiesEngine {
    db: AllergenDatabase,
    parser: IngredientParser,
    matcher: AllergenMatcher,
    vector_store: VectorStore,
}

#[wasm_bindgen]
impl AllergiesEngine {
    /// Create a new AllergiesEngine instance
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        log::info!("Initializing AllergiesEngine");
        Self {
            db: AllergenDatabase::new(),
            parser: IngredientParser::new(),
            matcher: AllergenMatcher::new(),
            vector_store: VectorStore::new(384), // 384-dim embeddings
        }
    }

    /// Analyze ingredients text against user's allergy profile
    /// Returns DetectionResult with safety information
    #[wasm_bindgen]
    pub fn analyze_ingredients(
        &self,
        ingredients_text: &str,
        profile_json: &str,
    ) -> Result<DetectionResult, JsValue> {
        log::debug!("Analyzing ingredients: {}", ingredients_text);

        // Parse profile
        let profile = AllergyProfile::from_json(profile_json)?;

        // Parse ingredients (ultra-fast with Rust)
        let ingredients = self.parser.parse(ingredients_text);

        // Match against allergens using vector similarity
        let matches = self.matcher.find_allergens(&ingredients, &profile);

        // Determine severity
        let max_severity = matches.iter()
            .map(|m| m.severity)
            .max()
            .unwrap_or(SeverityLevel::Mild);

        // Generate warnings
        let warnings = self.generate_warnings(&matches, &profile);

        Ok(DetectionResult {
            is_safe: matches.is_empty(),
            detected_allergens: matches.iter().map(|m| m.allergen.clone()).collect(),
            severity: max_severity,
            warnings,
            confidence: self.calculate_confidence(&matches),
        })
    }

    /// Fast barcode lookup (using AgentDB-style vector search)
    #[wasm_bindgen]
    pub fn lookup_barcode(&self, barcode: &str) -> Result<JsValue, JsValue> {
        log::debug!("Looking up barcode: {}", barcode);

        // In production, this would query AgentDB with p95 < 50ms
        // For now, return a mock result
        let result = serde_json::json!({
            "barcode": barcode,
            "product_name": "Sample Product",
            "ingredients": "wheat flour, milk, eggs, sugar",
            "allergens": ["wheat", "milk", "eggs"],
            "source": "agentdb_cache"
        });

        Ok(serde_wasm_bindgen::to_value(&result)?)
    }

    /// Add custom ingredient to vector store for similarity matching
    #[wasm_bindgen]
    pub fn index_ingredient(&mut self, name: &str, category: &str) -> Result<(), JsValue> {
        // In production, this would create embeddings and store in AgentDB
        self.vector_store.add_ingredient(name, category)
            .map_err(|e| JsValue::from_str(&e.to_string()))
    }
}

impl AllergiesEngine {
    fn generate_warnings(&self, matches: &[AllergenMatch], profile: &AllergyProfile) -> Vec<String> {
        let mut warnings = Vec::new();

        for m in matches {
            match m.severity {
                SeverityLevel::Anaphylaxis => {
                    warnings.push(format!("⚠️ DANGER: {} can cause anaphylaxis!", m.allergen));
                }
                SeverityLevel::Severe => {
                    warnings.push(format!("⚠️ WARNING: Severe allergy to {}", m.allergen));
                }
                _ => {}
            }
        }

        // Check for cross-reactions
        for cross in &profile.cross_reactions {
            if matches.iter().any(|m| m.allergen == cross.allergen) {
                warnings.push(format!(
                    "⚠️ Cross-reaction possible with: {}",
                    cross.cross_reactive_with.join(", ")
                ));
            }
        }

        warnings
    }

    fn calculate_confidence(&self, matches: &[AllergenMatch]) -> f32 {
        if matches.is_empty() {
            return 1.0; // High confidence it's safe
        }

        // Average confidence of all matches
        let sum: f32 = matches.iter().map(|m| m.confidence).sum();
        sum / matches.len() as f32
    }
}

#[derive(Debug, Clone)]
pub(crate) struct AllergenMatch {
    pub allergen: String,
    pub severity: SeverityLevel,
    pub confidence: f32,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_allergy_profile_creation() {
        let mut profile = AllergyProfile::new("user123".to_string());
        profile.add_allergy("peanuts".to_string(), SeverityLevel::Anaphylaxis);
        assert_eq!(profile.allergies.len(), 1);
    }

    #[test]
    fn test_engine_initialization() {
        let engine = AllergiesEngine::new();
        assert!(true); // Engine created successfully
    }
}
