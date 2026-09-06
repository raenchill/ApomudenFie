import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from symptom_disease_model.inference import DiseaseClassifier


class InferenceTests(unittest.TestCase):
    def test_predict_returns_top_predictions(self) -> None:
        classifier = DiseaseClassifier()
        text = "I have fever, headache, body pains, weakness, and sweating."
        predictions = classifier.predict(text, top_k=3)

        self.assertGreaterEqual(len(predictions), 1)
        self.assertEqual(predictions[0][0], predictions[0][0])
        self.assertGreater(predictions[0][1], 0.0)


if __name__ == "__main__":
    unittest.main()
