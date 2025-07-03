'use client';

import { useState, useCallback, useRef } from 'react';

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

export function useDeferredValidation(
  initialValues: Record<string, string> = {},
  rules: Record<string, ValidationRule> = {},
) {
  const [fields, setFields] = useState<Record<string, FieldState>>(() => {
    const initialFields: Record<string, FieldState> = {};
    Object.keys(initialValues).forEach((key) => {
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

  const validateField = useCallback(
    (fieldName: string, value: string): ValidationResult => {
      const rule = rules[fieldName];
      if (!rule) return { isValid: true };

      const capitalizedFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);

      if (rule.required && (!value || value.trim().length === 0)) {
        return { isValid: false, error: `${capitalizedFieldName} is required` };
      }

      if (!value && !rule.required) {
        return { isValid: true };
      }

      if (rule.minLength && value.length < rule.minLength) {
        return {
          isValid: false,
          error: `${capitalizedFieldName} must be at least ${rule.minLength} characters`,
        };
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return {
          isValid: false,
          error: `${capitalizedFieldName} must be no more than ${rule.maxLength} characters`,
        };
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return {
          isValid: false,
          error: `${capitalizedFieldName} format is invalid`,
        };
      }

      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          return { isValid: false, error: customError };
        }
      }

      return { isValid: true };
    },
    [rules],
  );

  const updateField = useCallback((fieldName: string, value: string) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,

        error: prev[fieldName]?.touched ? undefined : prev[fieldName]?.error,
      },
    }));
  }, []);

  const validateOnBlur = useCallback(
    (fieldName: string) => {
      const field = fields[fieldName];
      if (!field) return;

      const validation = validateField(fieldName, field.value);

      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          touched: true,
          error: validation.error,
        },
      }));
    },
    [fields, validateField],
  );

  const validateAsync = useCallback(
    (
      fieldName: string,
      asyncValidator: (value: string) => Promise<ValidationResult>,
      delay: number = 500,
    ) => {
      const field = fields[fieldName];
      if (!field) return;

      if (validationTimeouts.current[fieldName]) {
        clearTimeout(validationTimeouts.current[fieldName]);
      }

      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          validating: true,
        },
      }));

      validationTimeouts.current[fieldName] = setTimeout(async () => {
        try {
          const validation = await asyncValidator(field.value);

          setFields((prev) => ({
            ...prev,
            [fieldName]: {
              ...prev[fieldName],
              validating: false,
              error: validation.error,
            },
          }));
        } catch (error) {
          setFields((prev) => ({
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
    [fields],
  );

  const validateAll = useCallback((): { isValid: boolean; errors: string[] } => {
    let isValid = true;
    const errors: string[] = [];
    const newFields = { ...fields };

    Object.keys(newFields).forEach((fieldName) => {
      try {
        const fieldValue = newFields[fieldName]?.value || '';
        const validation = validateField(fieldName, fieldValue);

        newFields[fieldName] = {
          ...newFields[fieldName],
          touched: true,
          error: validation.error,
        };

        if (!validation.isValid && validation.error) {
          isValid = false;
          errors.push(validation.error);
        }
      } catch (error) {
        console.error(`Validation error for field ${fieldName}:`, error);
        isValid = false;
        errors.push(`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} validation failed`);
      }
    });

    setFields(newFields);
    return { isValid, errors };
  }, [fields, validateField]);

  const getFieldProps = useCallback(
    (fieldName: string) => ({
      value: fields[fieldName]?.value || '',
      onChange: (value: string) => updateField(fieldName, value),
      onBlur: () => validateOnBlur(fieldName),
      error: fields[fieldName]?.error,
      touched: fields[fieldName]?.touched || false,
      validating: fields[fieldName]?.validating || false,
    }),
    [fields, updateField, validateOnBlur],
  );

  const reset = useCallback(
    (newValues: Record<string, string> = {}) => {
      const resetFields: Record<string, FieldState> = {};
      Object.keys({ ...fields, ...newValues }).forEach((key) => {
        resetFields[key] = {
          value: newValues[key] || '',
          touched: false,
          validating: false,
        };
      });
      setFields(resetFields);
      setIsSubmitting(false);
    },
    [fields],
  );

  const getValues = useCallback(() => {
    const values: Record<string, string> = {};
    Object.keys(fields).forEach((key) => {
      values[key] = fields[key].value;
    });
    return values;
  }, [fields]);

  const hasErrors = useCallback(() => {
    return Object.values(fields).some((field) => field.error);
  }, [fields]);

  const isDirty = useCallback(() => {
    return Object.keys(fields).some((key) => {
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

export function useMarketplaceValidation() {
  const rules: Record<string, ValidationRule> = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      custom: (value: string) => {
        if (!value || value.trim().length === 0) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters long';
        if (value.length > 100) return 'Name cannot exceed 100 characters';
        return null;
      },
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      custom: (value: string) => {
        if (!value || value.trim().length === 0) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters long';
        if (value.length > 1000) return 'Description cannot exceed 1,000 characters';
        return null;
      },
    },
    content: {
      required: true,
      minLength: 5,
      maxLength: 50000,
      custom: (value: string) => {
        if (!value || value.trim().length === 0) return 'Code content is required';
        if (value.trim().length < 5) return 'Code must be at least 5 characters long';
        if (value.length > 50000) return 'Code cannot exceed 50,000 characters';
        return null;
      },
    },
    price: {
      custom: (value: string) => {
        if (!value || value.trim().length === 0) return null;

        const cleanValue = value.replace(/[^\d.]/g, '');
        const num = parseFloat(cleanValue);

        if (isNaN(num) || !isFinite(num)) return 'Price must be a valid number';
        if (num < 0.01) return 'Price must be at least $0.01 USD';
        if (num > 999999) return 'Price cannot exceed $999,999 USD';

        const decimalPlaces = (cleanValue.split('.')[1] || '').length;
        if (decimalPlaces > 2) return 'Price can have at most 2 decimal places';

        return null;
      },
    },
    walletAddress: {
      custom: (value: string) => {
        if (!value || value.trim().length === 0) return null;

        const trimmedValue = value.trim();

        if (trimmedValue.length < 32 || trimmedValue.length > 44) {
          return 'Solana wallet address must be 32-44 characters long';
        }

        if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmedValue)) {
          return 'Please enter a valid Solana wallet address (base58 format)';
        }

        return null;
      },
    },
    tags: {
      required: true,
      minLength: 2,
      custom: (value: string) => {
        if (!value || value.trim().length === 0) return 'Tags are required';

        try {
          const tags = value
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);

          if (tags.length === 0) return 'At least one tag is required';
          if (tags.length > 10) return 'Maximum 10 tags allowed';

          const invalidTag = tags.find((tag) => tag.length > 50);
          if (invalidTag) return `Tag "${invalidTag}" exceeds 50 characters`;

          const uniqueTags = new Set(tags.map(tag => tag.toLowerCase()));
          if (uniqueTags.size !== tags.length) return 'Duplicate tags are not allowed';

          return null;
        } catch (error) {
          console.error('Tags validation error:', error);
          return 'Invalid tags format';
        }
      },
    },
  };

  return useDeferredValidation({}, rules);
}
