import * as React from "react";
import { Rule, ValidationResult, validate } from "@traveloka/validation";
import { FieldInterface, FieldComponentProps } from "../types";
import registerField from "./registerField";
import isEqual from "lodash/isEqual";

export type FieldProps<T = any> = {
  component: React.ComponentType<
    FieldComponentProps<T> & { [key: string]: any }
  >;
  revalidateOnError?: boolean;
  validateOnChange?: boolean;
  normalize: (value: T) => T;
  name?: string;
  label?: string;
  onChange?: (value: T) => void;
  onError?: (error: ValidationResult) => T;
  defaultValue?: T;
  rules?: Rule;
  [key: string]: any;
};

export type FieldState<T = any> = {
  value: T;
  defaultValue: T;
  error: ValidationResult;
};

class FieldComponent<T>
  extends React.Component<FieldProps<T>, FieldState<T>>
  implements FieldInterface
{
  public static defaultProps: Pick<
    FieldProps,
    "revalidateOnError" | "validateOnChange" | "normalize"
  > = {
    revalidateOnError: true,
    validateOnChange: false,
    normalize: (value) => value,
  };

  private _value: any; //deferred value, to handle async setState
  private _defaultValue: any; //deferred defaultValue, to handle async setState
  private _error: any; //deferred error, to handle async setState

  constructor(props: any) {
    super(props);

    this._value = props.normalize(props.value || props.defaultValue);
    this._defaultValue = props.normalize(props.defaultValue);
    this._error = null;

    this.state = {
      value: this._value,
      defaultValue: this._defaultValue,
      error: this._error,
    };
  }

  public componentDidMount() {
    if (this.props.onChange) this.props.onChange(this.getValue());
  }

  public componentDidUpdate(prevProps: FieldProps) {
    if (!isEqual(prevProps.value, this.props.value)) {
      this.setValue(this.props.value);
    }
  }

  public render() {
    const { component: WrapperComponent, name, ...rest } = this.props;
    const label = this.ucwords(name);
    return (
      <WrapperComponent
        label={label}
        isDirty={this.isDirty()}
        error={this.getError()}
        name={name}
        {...rest}
        value={this.getValue()}
        onChange={this.handleOnChange}
      />
    );
  }

  public validate = (): ValidationResult => {
    const { rules = [] } = this.props;
    const error = validate(rules)(this.getValue());
    this.setError(error);
    return error;
  };

  public getValue = (): any => {
    return this._value;
  };

  public setValue = (dirtyValue: any): void => {
    const value = this.props.normalize(dirtyValue);

    this._value = value;
    this.setState({ value });
    const { revalidateOnError, validateOnChange } = this.props;
    if (validateOnChange || (revalidateOnError && this.getError())) {
      this.validate();
    }
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  public getError = () => {
    return this._error;
  };

  public setError = (error: ValidationResult) => {
    this._error = error;
    this.setState({ error });
    if (this.props.onError) {
      this.props.onError(error);
    }
    return error;
  };

  public reset = () => {
    this.setValue(this.getDefaultValue());
    this.setError(null);
  };

  public handleOnChange = (value: any) => {
    return this.setValue(value);
  };

  public ucwords = (str?: string) => {
    if (!str) return;
    return str.toLowerCase().replace(/\b[a-z]/g, (letter) => {
      return letter.toUpperCase();
    });
  };

  public initialize = (value: any) => {
    this._defaultValue = value;
    this.setState({ defaultValue: value });
    this.setValue(value);
  };

  public getDefaultValue = () => {
    return this._defaultValue;
  };

  public isDirty = () => {
    return !isEqual(this.getValue(), this.getDefaultValue());
  };

  public hasError = () => {
    return !!this.getError();
  };
}

export default registerField(FieldComponent);
