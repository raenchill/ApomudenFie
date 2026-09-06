export type Sex =
  | 'male'
  | 'female'
  | 'other'
  | 'prefer_not_to_say';

export interface SymptomCheckRequest {
  symptoms: string;
  age?: number | null;
  sex?: Sex | null;
  duration?: string | null;
  previousAnswers?: string[];
  contraindicationScreenComplete?: boolean;
}

export interface DiseasePrediction {
  disease: string;
  confidence: number;
}

export interface PossibleCondition {
  name: string;
  confidence: number;
  reason: string;
}

export interface ConfidenceAssessment {
  level: 'low' | 'uncertain' | 'higher' | 'insufficient';
  message: string;
}

export interface Explanation {
  summary: string;
  possibleConditions: PossibleCondition[];
  selfCare: string[];
  redFlags: string[];
  followUpQuestions: string[];
  recommendedAction: string;
  disclaimer: string;
}

export interface MedicineOption {
  medicineId: string;
  genericName: string;
  purpose: string;
}

export type MedicationGuidanceType =
  | 'otc_options'
  | 'prescription_required'
  | 'professional_care'
  | 'urgent_attention'
  | 'pharmacist_review'
  | 'unsupported_condition'
  | 'uncertain_prediction';

export interface MedicationGuidance {
  eligible: boolean;
  guidanceType: MedicationGuidanceType;
  message: string;
  medicines: MedicineOption[];
  searchPharmacies: boolean;
  allowPharmacySearch: boolean;
  requiresPrescription: boolean;
  requiresPharmacistReview: boolean;
  medicineIds: string[];
  medicineNames: string[];
  topCondition: string | null;
  topConfidence: number;
  confidenceMargin: number;
}

export interface CompletedSymptomResponse {
  status: 'completed';
  symptoms: string;
  classifierInput: string;
  predictions: DiseasePrediction[];
  confidenceAssessment: ConfidenceAssessment;
  explanation: Explanation;
  medicationGuidance: MedicationGuidance;
}

export interface ConversationResponse {
  status: 'conversation';
  message: string;
}

export interface NeedsMoreInformationResponse {
  status: 'needs_more_information';
  message: string;
  questions: string[];
}

export interface UnableToPredictResponse {
  status: 'unable_to_predict';
  message: string;
  medicationGuidance?: MedicationGuidance;
}

export interface UrgentAttentionResponse {
  status: 'urgent_attention';
  message: string;
  warning: string;
  medicationGuidance?: MedicationGuidance;
}

export type SymptomAnalysisResponse =
  | CompletedSymptomResponse
  | ConversationResponse
  | NeedsMoreInformationResponse
  | UnableToPredictResponse
  | UrgentAttentionResponse;

export interface SymptomStreamStatus {
  stage: string;
  message: string;
}

export interface SymptomStreamCallbacks {
  onStatus?: (status: SymptomStreamStatus) => void;
  onResult?: (result: SymptomAnalysisResponse) => void;
  onError?: (error: Error) => void;
}

class AIBackendService {
  private static instance: AIBackendService;

  private constructor() {}

  public static getInstance(): AIBackendService {
    if (!AIBackendService.instance) {
      AIBackendService.instance = new AIBackendService();
    }

    return AIBackendService.instance;
  }

  public async analyzeSymptoms(
    request: SymptomCheckRequest
  ): Promise<SymptomAnalysisResponse> {
    const endpoint = this.getEndpoint();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          this.buildRequestBody(request)
        ),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.detail ||
          data?.message ||
          `AI backend request failed with status ${response.status}.`;

        throw new Error(message);
      }

      return this.normalizeResponse(data);
    } catch (error) {
      const friendlyError = this.getFriendlyError(error);
      throw friendlyError;
    }
  }

  public async analyzeSymptomsStream(
    request: SymptomCheckRequest,
    callbacks: SymptomStreamCallbacks = {}
  ): Promise<SymptomAnalysisResponse> {
    const endpoint = this.getStreamEndpoint();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(
          this.buildRequestBody(request)
        ),
      });

      if (!response.ok) {
        const fallback = await response.json().catch(() => null);

        const message =
          fallback?.detail ||
          fallback?.message ||
          `AI streaming request failed with status ${response.status}.`;

        const error = new Error(message);
        callbacks.onError?.(error);
        throw this.getFriendlyError(error);
      }

      if (!response.body) {
        const error = new Error(
          'The AI backend did not return a readable stream.'
        );
        callbacks.onError?.(error);
        throw this.getFriendlyError(error);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      let finalResult: SymptomAnalysisResponse | null = null;

      const processEventBlock = (block: string) => {
        const lines = block
          .split('\n')
          .map((line) => line.trimEnd());

        let eventName = 'message';
        const dataLines: string[] = [];

        for (const line of lines) {
          if (!line || line.startsWith(':')) {
            continue;
          }

          if (line.startsWith('event:')) {
            eventName = line.slice('event:'.length).trim();
            continue;
          }

          if (line.startsWith('data:')) {
            dataLines.push(
              line.slice('data:'.length).trimStart()
            );
          }
        }

        if (dataLines.length === 0) {
          return;
        }

        let payload: any;

        try {
          payload = JSON.parse(dataLines.join('\n'));
        } catch {
          return;
        }

        if (eventName === 'status') {
          callbacks.onStatus?.({
            stage: this.toString(payload?.stage),
            message:
              this.toString(payload?.message) ||
              'AidFidelis is processing your request...',
          });
          return;
        }

        if (eventName === 'result') {
          const normalized = this.normalizeResponse(
            payload?.data
          );

          finalResult = normalized;
          callbacks.onResult?.(normalized);
          return;
        }

        if (eventName === 'error') {
          const error = new Error(
            this.toString(payload?.message) ||
              'The AI backend reported a streaming error.'
          );

          callbacks.onError?.(error);
          throw this.getFriendlyError(error);
        }
      };

      try {
        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, {
            stream: true,
          });

          buffer = buffer.replace(/\r\n/g, '\n');

          let boundaryIndex = buffer.indexOf('\n\n');

          while (boundaryIndex !== -1) {
            const eventBlock = buffer
              .slice(0, boundaryIndex)
              .trim();

            buffer = buffer.slice(boundaryIndex + 2);

            if (eventBlock) {
              processEventBlock(eventBlock);
            }

            boundaryIndex = buffer.indexOf('\n\n');
          }
        }

        const remaining = buffer.trim();

        if (remaining) {
          processEventBlock(remaining);
        }
      } catch (error) {
        try {
          await reader.cancel();
        } catch {
          // Ignore cancellation errors.
        }

        if (error instanceof Error) {
          callbacks.onError?.(error);
          throw this.getFriendlyError(error);
        }

        const unknownError = new Error(
          'An unexpected AI streaming error occurred.'
        );

        callbacks.onError?.(unknownError);
        throw this.getFriendlyError(unknownError);
      }

      if (!finalResult) {
        const error = new Error(
          'The AI stream ended before a final result was received.'
        );

        callbacks.onError?.(error);
        throw this.getFriendlyError(error);
      }

      return finalResult;
    } catch (error) {
      const friendlyError = this.getFriendlyError(error);
      callbacks.onError?.(friendlyError);
      throw friendlyError;
    }
  }

  private buildRequestBody(
    request: SymptomCheckRequest
  ) {
    return {
      symptoms: request.symptoms.trim(),
      age: request.age ?? null,
      sex: request.sex ?? null,
      duration: request.duration?.trim() || null,
      previous_answers: request.previousAnswers ?? [],
      contraindication_screen_complete:
        request.contraindicationScreenComplete ?? false,
    };
  }

  private getBaseUrl(): string {
    const configuredUrl =
      import.meta.env.VITE_AI_BACKEND_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      'http://127.0.0.1:8000';

    return configuredUrl
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/api\/symptom-check\/stream$/, '')
      .replace(/\/api\/symptom-check$/, '');
  }

  private getEndpoint(): string {
    return `${this.getBaseUrl()}/api/symptom-check`;
  }

  private getStreamEndpoint(): string {
    return `${this.getBaseUrl()}/api/symptom-check/stream`;
  }

  private getFriendlyError(error: unknown): Error {
    const rawMessage = error instanceof Error ? error.message : String(error ?? '');
    const normalized = rawMessage.toLowerCase();
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    if (isOffline || normalized.includes('failed to fetch') || normalized.includes('network') || normalized.includes('fetch')) {
      return new Error('No internet connection. Please check your connection and try again.');
    }

    if (
      normalized.includes('500') ||
      normalized.includes('503') ||
      normalized.includes('backend') ||
      normalized.includes('unavailable') ||
      normalized.includes('timed out') ||
      normalized.includes('connection refused')
    ) {
      return new Error('AidFidelis is temporarily unavailable. Please try again in a moment.');
    }

    if (rawMessage) {
      return new Error(rawMessage);
    }

    return new Error('AidFidelis could not complete the symptom check right now. Please try again.');
  }

  private normalizeResponse(data: any): SymptomAnalysisResponse {
    if (!data || typeof data !== 'object') {
      throw new Error('The AI backend returned an invalid response.');
    }

    if (data.status === 'conversation') {
      return {
        status: 'conversation',
        message:
          this.toString(data.message) ||
          'Hello! Tell me how you are feeling today.',
      };
    }

    if (data.status === 'needs_more_information') {
      return {
        status: 'needs_more_information',
        message:
          this.toString(data.message) ||
          'More symptom information is required.',
        questions: this.toStringArray(data.questions),
      };
    }

    if (data.status === 'urgent_attention') {
      return {
        status: 'urgent_attention',
        message:
          this.toString(data.message) ||
          'Urgent medical attention may be required.',
        warning: this.toString(data.warning),
        medicationGuidance: data.medication_guidance
          ? this.normalizeMedicationGuidance(
              data.medication_guidance
            )
          : undefined,
      };
    }

    if (data.status === 'unable_to_predict') {
      return {
        status: 'unable_to_predict',
        message:
          this.toString(data.message) ||
          'The symptom checker could not produce a reliable result.',
        medicationGuidance: data.medication_guidance
          ? this.normalizeMedicationGuidance(
              data.medication_guidance
            )
          : undefined,
      };
    }

    if (data.status !== 'completed') {
      throw new Error(
        this.toString(data.message) ||
          'The AI backend returned an unsupported response.'
      );
    }

    const explanation = data.explanation ?? {};
    const confidenceAssessment =
      data.confidence_assessment ?? {};

    return {
      status: 'completed',

      symptoms: this.toString(data.symptoms),

      classifierInput: this.toString(
        data.classifier_input
      ),

      predictions: Array.isArray(data.predictions)
        ? data.predictions
            .map((prediction: any) => ({
              disease: this.toString(
                prediction?.disease
              ),
              confidence: this.toNumber(
                prediction?.confidence
              ),
            }))
            .filter(
              (prediction: DiseasePrediction) =>
                Boolean(prediction.disease)
            )
        : [],

      confidenceAssessment: {
        level: this.normalizeConfidenceLevel(
          confidenceAssessment.level
        ),

        message: this.toString(
          confidenceAssessment.message
        ),
      },

      explanation: {
        summary: this.toString(
          explanation.summary
        ),

        possibleConditions: Array.isArray(
          explanation.possible_conditions
        )
          ? explanation.possible_conditions
              .map((condition: any) => ({
                name: this.toString(
                  condition?.name
                ),

                confidence: this.toNumber(
                  condition?.confidence
                ),

                reason: this.toString(
                  condition?.reason
                ),
              }))
              .filter(
                (condition: PossibleCondition) =>
                  Boolean(condition.name)
              )
          : [],

        selfCare: this.toStringArray(
          explanation.self_care
        ),

        redFlags: this.toStringArray(
          explanation.red_flags
        ),

        // IMPORTANT:
        // Active triage questions must ONLY come from a
        // `needs_more_information` response.
        //
        // Gemini may return educational follow-up suggestions in the final
        // explanation, but exposing them here can make the frontend continue
        // the question loop even though predictions are already complete.
        followUpQuestions: [],

        recommendedAction: this.toString(
          explanation.recommended_action
        ),

        disclaimer: this.toString(
          explanation.disclaimer
        ),
      },

      medicationGuidance:
        this.normalizeMedicationGuidance(
          data.medication_guidance
        ),
    };
  }

  private normalizeMedicationGuidance(
    value: any
  ): MedicationGuidance {
    const guidance =
      value && typeof value === 'object'
        ? value
        : {};

    return {
      eligible: Boolean(
        guidance.eligible
      ),

      guidanceType:
        this.normalizeMedicationGuidanceType(
          guidance.guidance_type
        ),

      message: this.toString(
        guidance.message
      ),

      medicines: Array.isArray(
        guidance.medicines
      )
        ? guidance.medicines
            .map((medicine: any) => ({
              medicineId: this.toString(
                medicine?.medicine_id
              ),

              genericName: this.toString(
                medicine?.generic_name
              ),

              purpose: this.toString(
                medicine?.purpose
              ),
            }))
            .filter(
              (medicine: MedicineOption) =>
                Boolean(medicine.medicineId)
            )
        : [],

      searchPharmacies: Boolean(
        guidance.search_pharmacies
      ),

      allowPharmacySearch: Boolean(
        guidance.allow_pharmacy_search ??
          guidance.search_pharmacies
      ),

      requiresPrescription: Boolean(
        guidance.requires_prescription
      ),

      requiresPharmacistReview: Boolean(
        guidance.requires_pharmacist_review
      ),

      medicineIds: this.toStringArray(
        guidance.medicine_ids
      ),

      medicineNames: this.toStringArray(
        guidance.medicine_names
      ),

      topCondition:
        guidance.top_condition !== null &&
        guidance.top_condition !== undefined
          ? this.toString(
              guidance.top_condition
            )
          : null,

      topConfidence: this.toNumber(
        guidance.top_confidence
      ),

      confidenceMargin: this.toNumber(
        guidance.confidence_margin
      ),
    };
  }

  private normalizeMedicationGuidanceType(
    value: unknown
  ): MedicationGuidanceType {
    if (
      value === 'otc_options' ||
      value === 'prescription_required' ||
      value === 'professional_care' ||
      value === 'urgent_attention' ||
      value === 'pharmacist_review' ||
      value === 'unsupported_condition' ||
      value === 'uncertain_prediction'
    ) {
      return value;
    }

    return 'professional_care';
  }

  private toStringArray(
    value: unknown
  ): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((entry) =>
        this.toString(entry)
      )
      .filter(Boolean);
  }

  private toString(
    value: unknown
  ): string {
    if (typeof value === 'string') {
      return value;
    }

    if (
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    return '';
  }

  private toNumber(
    value: unknown
  ): number {
    const numberValue = Number(value);

    return Number.isFinite(numberValue)
      ? numberValue
      : 0;
  }

  private normalizeConfidenceLevel(
    value: unknown
  ): ConfidenceAssessment['level'] {
    if (
      value === 'low' ||
      value === 'uncertain' ||
      value === 'higher' ||
      value === 'insufficient'
    ) {
      return value;
    }

    return 'insufficient';
  }
}

export const aiBackendService =
  AIBackendService.getInstance();