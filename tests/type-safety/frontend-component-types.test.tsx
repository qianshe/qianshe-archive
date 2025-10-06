/**
 * 前端组件类型测试
 * 验证React组件的Props类型和组件内部状态类型的安全性
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 组件Props类型定义验证器
class ComponentTypeValidator {
  /**
   * 验证组件Props类型
   */
  static validateComponentProps(
    componentName: string,
    props: any,
    expectedProps: Record<string, { type: string; required: boolean }>
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查必需的Props
    for (const [propName, propSchema] of Object.entries(expectedProps)) {
      if (propSchema.required && !(propName in props)) {
        errors.push(`Component ${componentName}: Missing required prop "${propName}"`);
        continue;
      }

      if (propName in props) {
        const value = props[propName];
        const actualType = Array.isArray(value) ? 'array' : typeof value;

        if (actualType !== propSchema.type) {
          // 特殊处理某些类型转换
          if (propSchema.type === 'boolean' && actualType === 'string') {
            if (value !== 'true' && value !== 'false') {
              errors.push(`Component ${componentName}: Prop "${propName}" expected boolean, got ${actualType} with invalid value "${value}"`);
            }
          } else if (propSchema.type === 'number' && actualType === 'string') {
            if (isNaN(Number(value))) {
              errors.push(`Component ${componentName}: Prop "${propName}" expected number, got ${actualType} with invalid value "${value}"`);
            }
          } else {
            errors.push(`Component ${componentName}: Prop "${propName}" expected ${propSchema.type}, got ${actualType}`);
          }
        }
      }
    }

    // 检查多余的Props（可能是拼写错误）
    const validPropNames = Object.keys(expectedProps);
    for (const propName of Object.keys(props)) {
      if (!validPropNames.includes(propName) && propName !== 'children') {
        warnings.push(`Component ${componentName}: Unknown prop "${propName}"`);
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * 验证组件状态类型
   */
  static validateComponentState(
    componentName: string,
    state: any,
    expectedState: Record<string, string>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof state !== 'object' || state === null) {
      errors.push(`Component ${componentName}: State must be an object`);
      return { isValid: false, errors };
    }

    for (const [stateKey, expectedType] of Object.entries(expectedState)) {
      if (!(stateKey in state)) {
        errors.push(`Component ${componentName}: Missing state key "${stateKey}"`);
        continue;
      }

      const value = state[stateKey];
      const actualType = Array.isArray(value) ? 'array' : typeof value;

      if (actualType !== expectedType) {
        errors.push(`Component ${componentName}: State "${stateKey}" expected ${expectedType}, got ${actualType}`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

// 模拟组件用于测试
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const MockButton = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick,
  className 
}: ButtonProps) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className || ''}`}
      disabled={disabled}
      onClick={onClick}
      data-testid="mock-button"
    >
      {children}
    </button>
  );
};

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

const MockInput = ({
  label,
  type = 'text',
  value,
  placeholder,
  required = false,
  disabled = false,
  error,
  onChange,
  onBlur
}: InputProps) => {
  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        data-testid="mock-input"
      />
      {error && <span className="error">{error}</span>}
    </div>
  );
};

interface CardProps {
  title: string;
  description?: string;
  imageUrl?: string;
  tags?: string[];
  author?: {
    name: string;
    avatar?: string;
  };
  actions?: React.ReactNode;
  className?: string;
}

const MockCard = ({
  title,
  description,
  imageUrl,
  tags = [],
  author,
  actions,
  className
}: CardProps) => {
  return (
    <div className={`card ${className || ''}`} data-testid="mock-card">
      {imageUrl && <img src={imageUrl} alt={title} />}
      <div className="card-content">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {tags.length > 0 && (
          <div className="tags">
            {tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
        {author && (
          <div className="author">
            {author.avatar && <img src={author.avatar} alt={author.name} />}
            <span>{author.name}</span>
          </div>
        )}
        {actions && <div className="actions">{actions}</div>}
      </div>
    </div>
  );
};

// 组件类型定义
const ComponentSchemas = {
  Button: {
    children: { type: 'object', required: true },
    variant: { type: 'string', required: false },
    size: { type: 'string', required: false },
    disabled: { type: 'boolean', required: false },
    onClick: { type: 'function', required: false },
    className: { type: 'string', required: false }
  },
  Input: {
    label: { type: 'string', required: false },
    type: { type: 'string', required: false },
    value: { type: 'string', required: true },
    placeholder: { type: 'string', required: false },
    required: { type: 'boolean', required: false },
    disabled: { type: 'boolean', required: false },
    error: { type: 'string', required: false },
    onChange: { type: 'function', required: true },
    onBlur: { type: 'function', required: false }
  },
  Card: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
    imageUrl: { type: 'string', required: false },
    tags: { type: 'array', required: false },
    author: { type: 'object', required: false },
    actions: { type: 'object', required: false },
    className: { type: 'string', required: false }
  }
};

describe('前端组件类型测试', () => {
  describe('Button组件类型验证', () => {
    it('应该接受正确的Props类型', () => {
      const props = {
        children: 'Click me',
        variant: 'primary' as const,
        size: 'medium' as const,
        disabled: false,
        onClick: () => console.log('clicked'),
        className: 'custom-class'
      };

      const validation = ComponentTypeValidator.validateComponentProps('Button', props, ComponentSchemas.Button);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('应该正确处理必需的Props', () => {
      const props = {
        variant: 'primary' as const,
        size: 'medium' as const
        // 缺少必需的children
      };

      const validation = ComponentTypeValidator.validateComponentProps('Button', props, ComponentSchemas.Button);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Component Button: Missing required prop "children"');
    });

    it('应该验证Props的枚举值', () => {
      const props = {
        children: 'Click me',
        variant: 'invalid-variant' as any,
        size: 'medium' as const
      };

      // 基础类型检查会通过，但实际使用中会有运行时错误
      const validation = ComponentTypeValidator.validateComponentProps('Button', props, ComponentSchemas.Button);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('应该正确渲染Button组件', () => {
      const handleClick = vi.fn();
      render(<MockButton onClick={handleClick}>Test Button</MockButton>);
      
      const button = screen.getByTestId('mock-button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Test Button');
      
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input组件类型验证', () => {
    it('应该接受正确的Props类型', () => {
      const props = {
        label: 'Email',
        type: 'email' as const,
        value: 'test@example.com',
        placeholder: 'Enter your email',
        required: true,
        disabled: false,
        error: '',
        onChange: (value: string) => console.log(value),
        onBlur: () => console.log('blurred')
      };

      const validation = ComponentTypeValidator.validateComponentProps('Input', props, ComponentSchemas.Input);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('应该正确处理受控组件', async () => {
      const mockOnChange = vi.fn();
      render(<MockInput value="initial" onChange={mockOnChange} />);
      
      const input = screen.getByTestId('mock-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('initial');
      
      await userEvent.type(input, ' test');
      expect(mockOnChange).toHaveBeenCalledTimes(5); // ' test' = 5 characters
    });

    it('应该正确处理错误状态', () => {
      render(<MockInput value="" onChange={() => {}} error="This field is required" />);
      
      const input = screen.getByTestId('mock-input');
      const error = screen.getByText('This field is required');
      
      expect(input).toBeInTheDocument();
      expect(error).toBeInTheDocument();
    });
  });

  describe('Card组件类型验证', () => {
    it('应该接受正确的Props类型', () => {
      const props = {
        title: 'Test Card',
        description: 'This is a test card',
        imageUrl: 'https://example.com/image.jpg',
        tags: ['React', 'TypeScript', 'Testing'],
        author: {
          name: 'Test Author',
          avatar: 'https://example.com/avatar.jpg'
        },
        actions: <button>Action</button>,
        className: 'custom-card'
      };

      const validation = ComponentTypeValidator.validateComponentProps('Card', props, ComponentSchemas.Card);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('应该正确渲染Card组件', () => {
      const props = {
        title: 'Test Card',
        description: 'This is a test card',
        tags: ['React', 'TypeScript'],
        author: { name: 'Test Author' }
      };

      render(<MockCard {...props} />);
      
      const card = screen.getByTestId('mock-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('Test Card');
      expect(card).toHaveTextContent('This is a test card');
      expect(card).toHaveTextContent('React');
      expect(card).toHaveTextContent('TypeScript');
      expect(card).toHaveTextContent('Test Author');
    });

    it('应该正确处理可选Props', () => {
      const props = {
        title: 'Minimal Card'
        // 只有必需的title
      };

      const validation = ComponentTypeValidator.validateComponentProps('Card', props, ComponentSchemas.Card);
      expect(validation.isValid).toBe(true);
      
      render(<MockCard {...props} />);
      
      const card = screen.getByTestId('mock-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent('Minimal Card');
    });
  });

  describe('组件事件处理类型验证', () => {
    it('应该正确处理onClick事件', () => {
      const handleClick = vi.fn();
      render(<MockButton onClick={handleClick}>Click me</MockButton>);
      
      const button = screen.getByTestId('mock-button');
      fireEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该正确处理onChange事件', async () => {
      const handleChange = vi.fn();
      render(<MockInput value="" onChange={handleChange} />);
      
      const input = screen.getByTestId('mock-input');
      await userEvent.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalledWith('t');
      expect(handleChange).toHaveBeenCalledWith('e');
      expect(handleChange).toHaveBeenCalledWith('s');
      expect(handleChange).toHaveBeenCalledWith('t');
    });

    it('应该正确处理onBlur事件', () => {
      const handleBlur = vi.fn();
      render(<MockInput value="" onChange={() => {}} onBlur={handleBlur} />);
      
      const input = screen.getByTestId('mock-input');
      fireEvent.blur(input);
      
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('组件条件渲染类型验证', () => {
    it('应该根据条件正确渲染组件', () => {
      const TestComponent = ({ showButton, showInput }: { showButton: boolean; showInput: boolean }) => (
        <div>
          {showButton && <MockButton>Button</MockButton>}
          {showInput && <MockInput value="" onChange={() => {}} />}
        </div>
      );

      const { rerender } = render(<TestComponent showButton={true} showInput={false} />);
      
      expect(screen.getByTestId('mock-button')).toBeInTheDocument();
      expect(screen.queryByTestId('mock-input')).not.toBeInTheDocument();

      rerender(<TestComponent showButton={false} showInput={true} />);
      
      expect(screen.queryByTestId('mock-button')).not.toBeInTheDocument();
      expect(screen.getByTestId('mock-input')).toBeInTheDocument();
    });

    it('应该正确处理数组渲染', () => {
      const items = [
        { id: 1, title: 'Item 1' },
        { id: 2, title: 'Item 2' },
        { id: 3, title: 'Item 3' }
      ];

      const TestComponent = () => (
        <div>
          {items.map(item => (
            <MockCard key={item.id} title={item.title} />
          ))}
        </div>
      );

      render(<TestComponent />);
      
      const cards = screen.getAllByTestId('mock-card');
      expect(cards).toHaveLength(3);
      expect(cards[0]).toHaveTextContent('Item 1');
      expect(cards[1]).toHaveTextContent('Item 2');
      expect(cards[2]).toHaveTextContent('Item 3');
    });
  });

  describe('组件状态类型验证', () => {
    it('应该正确管理组件状态', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        const [text, setText] = React.useState('');
        const [isLoading, setIsLoading] = React.useState(false);

        const state = { count, text, isLoading };
        const expectedState = { count: 'number', text: 'string', isLoading: 'boolean' };
        
        const validation = ComponentTypeValidator.validateComponentState('TestComponent', state, expectedState);
        expect(validation.isValid).toBe(true);

        return (
          <div>
            <span data-testid="count">{count}</span>
            <input 
              data-testid="text-input"
              value={text} 
              onChange={(e) => setText(e.target.value)}
            />
            <button 
              data-testid="loading-button"
              onClick={() => setIsLoading(!isLoading)}
            >
              {isLoading ? 'Loading...' : 'Loaded'}
            </button>
          </div>
        );
      };

      render(<TestComponent />);
      
      const count = screen.getByTestId('count');
      const textInput = screen.getByTestId('text-input');
      const loadingButton = screen.getByTestId('loading-button');

      expect(count).toHaveTextContent('0');
      expect(textInput).toHaveValue('');
      expect(loadingButton).toHaveTextContent('Loaded');

      fireEvent.change(textInput, { target: { value: 'test' } });
      expect(textInput).toHaveValue('test');

      fireEvent.click(loadingButton);
      expect(loadingButton).toHaveTextContent('Loading...');
    });
  });

  describe('组件Context类型验证', () => {
    it('应该正确使用TypeScript Context', () => {
      interface ThemeContextType {
        theme: 'light' | 'dark';
        toggleTheme: () => void;
      }

      const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

      const TestConsumer = () => {
        const theme = React.useContext(ThemeContext);
        
        if (!theme) {
          throw new Error('ThemeContext is not provided');
        }

        return <div data-testid="theme-display">{theme.theme}</div>;
      };

      const TestProvider = ({ children }: { children: React.ReactNode }) => {
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
        
        const toggleTheme = () => {
          setTheme(prev => prev === 'light' ? 'dark' : 'light');
        };

        return (
          <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
          </ThemeContext.Provider>
        );
      };

      render(
        <TestProvider>
          <TestConsumer />
        </TestProvider>
      );

      const themeDisplay = screen.getByTestId('theme-display');
      expect(themeDisplay).toHaveTextContent('light');
    });
  });

  describe('组件自定义Hook类型验证', () => {
    it('应该正确使用自定义Hook', () => {
      const useCounter = (initialValue: number = 0) => {
        const [count, setCount] = React.useState(initialValue);
        const increment = () => setCount(prev => prev + 1);
        const decrement = () => setCount(prev => prev - 1);
        const reset = () => setCount(initialValue);

        return { count, increment, decrement, reset };
      };

      const TestComponent = () => {
        const { count, increment, decrement, reset } = useCounter(5);

        return (
          <div>
            <span data-testid="count">{count}</span>
            <button data-testid="increment" onClick={increment}>+</button>
            <button data-testid="decrement" onClick={decrement}>-</button>
            <button data-testid="reset" onClick={reset}>Reset</button>
          </div>
        );
      };

      render(<TestComponent />);
      
      const countDisplay = screen.getByTestId('count');
      const incrementBtn = screen.getByTestId('increment');
      const decrementBtn = screen.getByTestId('decrement');
      const resetBtn = screen.getByTestId('reset');

      expect(countDisplay).toHaveTextContent('5');

      fireEvent.click(incrementBtn);
      expect(countDisplay).toHaveTextContent('6');

      fireEvent.click(decrementBtn);
      expect(countDisplay).toHaveTextContent('5');

      fireEvent.click(resetBtn);
      expect(countDisplay).toHaveTextContent('5');
    });
  });
});