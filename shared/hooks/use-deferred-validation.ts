'use client';

import { useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldState {
  value: string;
  error?: string;
  touched: boolean;
  validating: boolean;
}

/**
 * Optimized validation hook that defers validation until blur or submit
 * Improves performance by avoiding real-time validation during typing
 */
export function useDeferredValidation(
  initialValues: Record<string, string> = {},
  rules: Record<string, ValidationRule> = {}
) {
  const [fields, setFields] = useState<Record<string, FieldState>>(() => {
    const initialFields: Record<string, FieldState> = {};
    Object.keys(initialValues).forEach(key => {
      initialFields[key] = {
        value: initialValues[key] || '',
        touched: false,
        validating: false,
      };
    });
    return initialFields;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const validationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // Validate a single field
  const validateField = useCallback(
    (fieldName: string, value: string): ValidationResult => {
      const rule = rules[fieldName];
      if (!rule) return { isValid: true };

      // Required validation
      if (rule.required && (!value || value.trim().length === 0)) {
        return { isValid: false, error: `${fieldName} is required` };
      }

      // Skip other validations if field is empty and not required
      if (!value && !rule.required) {
        return { isValid: true };
      }

      // Min length validation
      if (rule.minLength && value.length < rule.minLength) {
        return {
          isValid: false,
          error: `${fieldName} must be at least ${rule.minLength} characters`,
        };
      }

      // Max length validation
      if (rule.maxLength && value.length > rule.maxLength) {
        return {
          isValid: false,
          error: `${fieldName} must be no more than ${rule.maxLength} characters`,
        };
      }

      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        return {
          isValid: false,
          error: `${fieldName} format is invalid`,
        };
      }

      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          return { isValid: false, error: customError };
        }
      }

      return { isValid: true };
    },
    [rules]
  );

  // Update field value (called on every keystroke)
  const updateField = useCallback((fieldName: string, value: string) => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        // Clear error when user starts typing (if field was previously touched)
        error: prev[fieldName]?.touched ? undefined : prev[fieldName]?.error,
      },
    }));
  }, []);

  // Validate field on blur (deferred validation)
  const validateOnBlur = useCallback(
    (fieldName: string) => {
      const field = fields[fieldName];
      if (!field) return;

      const validation = validateField(fieldName, field.value);
      
      setFields(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          touched: true,
          error: validation.error,
        },
      }));
    },
    [fields, validateField]
  );

  // Async validation with debouncing (for API calls)
  const validateAsync = useCallback(
    (
      fieldName: string,
      asyncValidator: (value: string) => Promise<ValidationResult>,
      delay: number = 500
    ) => {
      const field = fields[fieldName];
      if (!field) return;

      // Clear existing timeout
      if (validationTimeouts.current[fieldName]) {
        clearTimeout(validationTimeouts.current[fieldName]);
      }

      // Set validating state
      setFields(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          validating: true,
        },
      }));

      // Debounced async validation
      validationTimeouts.current[fieldName] = setTimeout(async () => {
        try {
          const validation = await asyncValidator(field.value);
          
          setFields(prev => ({
            ...prev,
            [fieldName]: {
              ...prev[fieldName],
              validating: false,
              error: validation.error,
            },
          }));
        } catch (error) {
          setFields(prev => ({
            ...prev,
            [fieldName]: {
              ...prev[fieldName],
              validating: false,
              error: 'Validation failed',
            },
          }));
        }
      }, delay);
    },
    [fields]
  );

  // Validate all fields (called on submit)
  const validateAll = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    Object.keys(newFields).forEach(fieldName => {
      const validation = validateField(fieldName, newFields[fieldName].value);
      newFields[fieldName] = {
        ...newFields[fieldName],
        touched: true,
        error: validation.error,
      };

      if (!validation.isValid) {
        isValid = false;
      }
    });

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  // Get field props for easy integration with form inputs
  const getFieldProps = useCallback(
    (fieldName: string) => ({
      value: fields[fieldName]?.value || '',
      onChange: (value: string) => updateField(fieldName, value),
      onBlur: () => validateOnBlur(fieldName),
      error: fields[fieldName]?.error,
      touched: fields[fieldName]?.touched || false,
      validating: fields[fieldName]?.validating || false,
    }),
    [fields, updateField, validateOnBlur]
  );

  // Reset form
  const reset = useCallback((newValues: Record<string, string> = {}) => {
    const resetFields: Record<string, FieldState> = {};
    Object.keys({ ...fields, ...newValues }).forEach(key => {
      resetFields[key] = {
        value: newValues[key] || '',
        touched: false,
        validating: false,
      };
    });
    setFields(resetFields);
    setIsSubmitting(false);
  }, [fields]);

  // Get all values
  const getValues = useCallback(() => {
    const values: Record<string, string> = {};
    Object.keys(fields).forEach(key => {
      values[key] = fields[key].value;
    });
    return values;
  }, [fields]);

  // Check if form has errors
  const hasErrors = useCallback(() => {
    return Object.values(fields).some(field => field.error);
  }, [fields]);

  // Check if form is dirty (has changes)
  const isDirty = useCallback(() => {
    return Object.keys(fields).some(key => {
      return fields[key].value !== (initialValues[key] || '');
    });
  }, [fields, initialValues]);

  return {
    fields,
    updateField,
    validateOnBlur,
    validateAsync,
    validateAll,
    getFieldProps,
    reset,
    getValues,
    hasErrors,
    isDirty,
    isSubmitting,
    setIsSubmitting,
  };
}

/**
 * Specialized hook for marketplace form validation
 */
export function useMarketplaceValidation() {
  const rules: Record<string, ValidationRule> = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 500,
    },
    content: {
      required: true,
      minLength: 5,
      maxLength: 10000,
    },
    price: {
      custom: (value: string) => {
        if (!value) return null; // Optional for free items
        const num = parseFloat(value);
        if (isNaN(num)) return 'Price must be a valid number';
        if (num < 0.000001) return 'Price must be at least 0.000001 SOL';
        if (num > 999) return 'Price cannot exceed 999 SOL';
        return null;
      },
    },
    walletAddress: {
      custom: (value: string) => {
        if (!value) return null; // Optional for free items
        // Basic Solana address validation (base58, 32-44 chars)
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) {
          return 'Invalid Solana wallet address';
        }
        return null;
      },
    },
    tags: {
      required: true,
      minLength: 2,
      custom: (value: string) => {
        const tags = value.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length === 0) return 'At least one tag is required';
        if (tags.length > 10) return 'Maximum 10 tags allowed';
        if (tags.some(tag => tag.length > 20)) return 'Each tag must be 20 characters or less';
        return null;
      },
    },
  };

  return useDeferredValidation({}, rules);
}
