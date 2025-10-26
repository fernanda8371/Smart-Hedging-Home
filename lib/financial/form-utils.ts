import type { ParameterSchema } from './types'

export interface FormField {
  name: string
  type: 'number' | 'select' | 'checkbox' | 'range'
  label: string
  description?: string
  placeholder?: string
  defaultValue?: any
  validation?: {
    required?: boolean
    min?: number
    max?: number
    step?: number
  }
  options?: Array<{ value: any; label: string }>
}

export function generateFormFields(schema: ParameterSchema): FormField[] {
  return Object.entries(schema).map(([name, config]) => {
    let fieldType: FormField['type'] = 'number'
    
    switch (config.type) {
      case 'select':
        fieldType = 'select'
        break
      case 'boolean':
        fieldType = 'checkbox'
        break
      case 'percentage':
      case 'currency':
      case 'number':
        fieldType = config.min !== undefined && config.max !== undefined ? 'range' : 'number'
        break
    }
    
    return {
      name,
      type: fieldType,
      label: config.label,
      description: config.description,
      defaultValue: config.default,
      validation: {
        min: config.min,
        max: config.max,
        step: config.step
      },
      options: config.options
    }
  })
}

export function validateFormData(data: Record<string, any>, schema: ParameterSchema) {
  const errors: Record<string, string> = {}
  
  Object.entries(schema).forEach(([name, config]) => {
    const value = data[name]
    
    if (config.validation) {
      const error = config.validation(value)
      if (error) errors[name] = error
    }
    
    if (config.min !== undefined && value < config.min) {
      errors[name] = `Must be at least ${config.min}`
    }
    
    if (config.max !== undefined && value > config.max) {
      errors[name] = `Must be at most ${config.max}`
    }
  })
  
  return errors
}
