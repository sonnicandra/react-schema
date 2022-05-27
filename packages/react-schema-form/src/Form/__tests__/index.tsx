import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import FormComponent from "../index";
import Field from "../../Field";

class Input extends React.Component<any, any> {
  public render() {
    return <input {...this.props} />;
  }
}

describe("test Form", () => {
  describe("test render", () => {
    it("should able render without name", () => {
      const testRenderer = TestRenderer.create(<FormComponent />);
      const testInstance = testRenderer.root;
      expect(testInstance.findByType(FormComponent)).toBeTruthy();
    });
  });

  it("validation result should be consistent", () => {
    const MAX_LENGTH = 5;
    const maxLengthRule = (maxLength: number) => (value: string) => {
      return value.length > maxLength
        ? `Max length of ${maxLength} characters is reached.`
        : null;
    };

    let form;
    const testRenderer = TestRenderer.create(
      <FormComponent fieldRef={(ref) => (form = ref)}>
        <Field
          name="description"
          component={Input}
          rules={[maxLengthRule(MAX_LENGTH)]}
        />
      </FormComponent>
    );
    const testInstance = testRenderer.root;
    const description = testInstance.findByType(Input);

    description.props.onChange("abc");
    form.validate();
    expect(form.hasError()).toBeFalsy();
    expect(form.getErrorField("description")).toBeNull();

    description.props.onChange("abcdef");
    form.validate();
    expect(form.hasError()).toBeTruthy();
    expect(form.getErrorField("description")).toEqual(
      "Max length of 5 characters is reached."
    );

    description.props.onChange("abcde");
    form.validate();
    expect(form.hasError()).toBeFalsy();
    expect(form.getErrorField("description")).toBeNull();
  });

  describe("test children as function", () => {
    it("should pass isDirty and hasError", () => {
      const testRenderer = TestRenderer.create(
        <FormComponent>{(state) => <Input {...state} />}</FormComponent>
      );
      const testInstance = testRenderer.root;
      expect(
        testInstance.findByProps({
          isDirty: false,
          hasError: false,
        })
      ).toBeTruthy();
    });

    it("values should be correct", () => {
      let form = null;
      class CheckboxField extends React.Component<any> {
        public render() {
          return null;
        }
      }
      class TComp extends React.Component<{ isChecked: boolean }> {
        public render() {
          return null;
        }
      }
      const testRenderer = TestRenderer.create(
        <FormComponent fieldRef={(el) => (form = el)}>
          {(state) => (
            <>
              <Field name="checked" component={CheckboxField} />
              <TComp isChecked={state.values.checked} />
            </>
          )}
        </FormComponent>
      );
      const testInstance = testRenderer.root;
      const inputEl = testInstance.findByType(CheckboxField).instance;
      const textEl = testInstance.findByType(TComp).instance;
      inputEl.props.onChange(true);
      expect(textEl.props.isChecked).toEqual(true);
      inputEl.props.onChange(false);
      expect(textEl.props.isChecked).toEqual(false);
    });
  });

  describe("test notifyOnChange", () => {
    it("should call notifyOnChange when field is setValue", () => {
      let form = null;
      class Button extends React.Component {
        public render() {
          return null;
        }
      }
      const testRenderer = TestRenderer.create(
        <FormComponent fieldRef={(el) => (form = el)}>
          {(state) => (
            <>
              <Field name="email" component={Input} />
              <Button {...state} />
            </>
          )}
        </FormComponent>
      );
      const testInstance = testRenderer.root;
      const inputEl = testInstance.findByType(Input);
      const buttonEl = testInstance.findByType(Button);
      inputEl.props.onChange("new value");
      expect(buttonEl.props.isDirty).toEqual(true);
      expect(buttonEl.props.hasError).toEqual(false);
      form.setValue({
        email: undefined,
      });
      expect(buttonEl.props.isDirty).toEqual(false);
      expect(buttonEl.props.hasError).toEqual(false);
    });
  });

  it("hasError should true when field is error", () => {
    let form = null;
    class Button extends React.Component {
      public render() {
        return null;
      }
    }
    const rule = (value) => {
      return value !== "key" ? "invalid" : null;
    };
    const testRenderer = TestRenderer.create(
      <FormComponent fieldRef={(el) => (form = el)}>
        {(state) => (
          <>
            <Field name="email" rules={rule} component={Input} />
            <Button {...state} />
          </>
        )}
      </FormComponent>
    );
    const testInstance = testRenderer.root;
    const inputEl = testInstance.findByType(Input);
    const buttonEl = testInstance.findByType(Button);
    inputEl.props.onChange("new value");
    form.validate();
    expect(buttonEl.props.isDirty).toEqual(true);
    expect(buttonEl.props.hasError).toEqual(true);
    form.setValue({
      email: "key",
    });
    expect(buttonEl.props.isDirty).toEqual(true);
    expect(buttonEl.props.hasError).toEqual(false);
  });

  it("[children function] should rerender and give new value", () => {
    let form = null;
    class InputField extends React.Component<any> {
      public render() {
        return null;
      }
    }
    class TComp extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    const testRenderer = TestRenderer.create(
      <FormComponent fieldRef={(el) => (form = el)}>
        {(state) => (
          <>
            <Field name="email" component={InputField} />
            <TComp title={state.values.email} />
          </>
        )}
      </FormComponent>
    );
    const testInstance = testRenderer.root;
    const inputEl = testInstance.findByType(InputField).instance;
    const textEl = testInstance.findByType(TComp).instance;
    inputEl.props.onChange("new value");
    expect(textEl.props.title).toEqual("new value");
    inputEl.props.onChange("new");
    expect(textEl.props.title).toEqual("new");
  });

  it("[children function] defaultValue should be passed to values", () => {
    let form = null;
    class InputField extends React.Component<any> {
      public render() {
        return null;
      }
    }
    class TComp extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    const testRenderer = TestRenderer.create(
      <FormComponent fieldRef={(el) => (form = el)}>
        {(state) => (
          <>
            <Field
              name="firstName"
              component={InputField}
              defaultValue="Jacky"
            />
            <Field
              name="lastName"
              component={InputField}
              defaultValue="Wijaya"
            />
            <TComp title={state.values} />
          </>
        )}
      </FormComponent>
    );
    const testInstance = testRenderer.root;
    const textEl = testInstance.findByType(TComp).instance;
    expect(textEl.props.title).toMatchObject({
      firstName: "Jacky",
      lastName: "Wijaya",
    });
  });

  it("[nested form] able to have nested forms", () => {
    let form = null;
    class EmailField extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    class FirstField extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    class LastField extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    class TComp extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    const testRenderer = TestRenderer.create(
      <FormComponent fieldRef={(el) => (form = el)}>
        {(state) => (
          <>
            <Field name="email" component={EmailField} />
            <FormComponent name="profile">
              <>
                <Field name="first" component={FirstField} />
                <Field name="last" component={LastField} />
              </>
            </FormComponent>
            <TComp {...state} />
          </>
        )}
      </FormComponent>
    );
    const testInstance = testRenderer.root;
    const emailEl = testInstance.findByType(EmailField).instance;
    const firstEl = testInstance.findByType(FirstField).instance;
    const lastEl = testInstance.findByType(LastField).instance;
    emailEl.props.onChange("jacky.wijaya@traveloka.com");
    firstEl.props.onChange("jacky");
    lastEl.props.onChange("wijaya");

    expect(form.getValue()).toMatchObject({
      email: "jacky.wijaya@traveloka.com",
      profile: {
        first: "jacky",
        last: "wijaya",
      },
    });
    const dataEl = testInstance.findByType(TComp).instance;
    expect(dataEl.props.values).toMatchObject({
      email: "jacky.wijaya@traveloka.com",
      profile: {
        first: "jacky",
        last: "wijaya",
      },
    });
  });

  it("[nested form] error should be passed", () => {
    const required = (value) => (!!value ? null : "required");
    let form = null;
    let formProfile = null;
    class EmailField extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    class FirstField extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    class LastField extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    class TComp extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    class TComp2 extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    const testRenderer = TestRenderer.create(
      <FormComponent fieldRef={(el) => (form = el)}>
        {(state) => (
          <>
            <Field name="email" component={EmailField} />
            <FormComponent name="profile" fieldRef={(el) => (formProfile = el)}>
              {(state2) => (
                <>
                  <Field name="first" component={FirstField} rules={required} />
                  <Field name="last" component={LastField} rules={required} />
                  <TComp2 {...state2} />
                </>
              )}
            </FormComponent>
            <TComp {...state} />
          </>
        )}
      </FormComponent>
    );
    const testInstance = testRenderer.root;
    const emailEl = testInstance.findByType(EmailField).instance;
    const firstEl = testInstance.findByType(FirstField).instance;
    const lastEl = testInstance.findByType(LastField).instance;
    const stateEl = testInstance.findByType(TComp).instance;
    const state2El = testInstance.findByType(TComp2).instance;
    formProfile.validate();
    expect(state2El.props.hasError).toEqual(true);
    expect(stateEl.props.hasError).toEqual(true);
    firstEl.props.onChange("jacky");
    lastEl.props.onChange("wijaya");
    expect(state2El.props.hasError).toEqual(false);
    expect(stateEl.props.hasError).toEqual(false);
  });

  it("[props array] should return values as array", () => {
    class FirstField extends React.Component<any> {
      public render() {
        return null;
      }
    }
    class LastField extends React.Component<any> {
      public render() {
        return null;
      }
    }
    class TComp extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    let form = null;
    const testRenderer = TestRenderer.create(
      <FormComponent fieldRef={(el) => (form = el)} array>
        {(state) => (
          <>
            <Field name="0" component={FirstField} />
            <Field name="1" component={LastField} />
            <TComp {...state} />
          </>
        )}
      </FormComponent>
    );
    const testInstance = testRenderer.root;
    const firstEl = testInstance.findByType(FirstField).instance;
    const lastEl = testInstance.findByType(LastField).instance;
    firstEl.props.onChange("jacky");
    lastEl.props.onChange("wijaya");
    expect(form.getValue()).toMatchObject(["jacky", "wijaya"]);
    const stateEl = testInstance.findByType(TComp).instance;
    expect(stateEl.props.values).toMatchObject(["jacky", "wijaya"]);
  });

  it("[props normalize] normalize the value", () => {
    class FirstField extends React.Component<any> {
      public render() {
        return null;
      }
    }
    class LastField extends React.Component<any> {
      public render() {
        return null;
      }
    }
    class TComp extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    let form = null;
    const testRenderer = TestRenderer.create(
      <FormComponent
        fieldRef={(el) => (form = el)}
        normalize={(value) => Object.values(value)}
      >
        {(state) => (
          <>
            <Field name="first" component={FirstField} />
            <Field name="last" component={LastField} />
            <TComp {...state} />
          </>
        )}
      </FormComponent>
    );
    const testInstance = testRenderer.root;
    const firstEl = testInstance.findByType(FirstField).instance;
    const lastEl = testInstance.findByType(LastField).instance;
    firstEl.props.onChange("jacky");
    lastEl.props.onChange("wijaya");
    expect(form.getValue()).toMatchObject(["jacky", "wijaya"]);
    const stateEl = testInstance.findByType(TComp).instance;
    expect(stateEl.props.values).toMatchObject(["jacky", "wijaya"]);
  });

  it("[props onChange] props onChange should give correct values", () => {
    class FirstField extends React.Component<any> {
      public render() {
        return null;
      }
    }
    class LastField extends React.Component<any> {
      public render() {
        return null;
      }
    }
    class TComp extends React.Component<{ title: string }> {
      public render() {
        return null;
      }
    }
    let form = null;
    const onChangeMock = jest.fn();
    const testRenderer = TestRenderer.create(
      <FormComponent fieldRef={(el) => (form = el)} onChange={onChangeMock}>
        {(state) => (
          <>
            <Field name="first" component={FirstField} defaultValue="jacky" />
            <Field name="last" component={LastField} defaultValue="wijaya" />
            <TComp {...state} />
          </>
        )}
      </FormComponent>
    );
    expect(onChangeMock).toHaveBeenCalledWith({
      first: "jacky",
      last: "wijaya",
    });
    onChangeMock.mockClear();
    const testInstance = testRenderer.root;
    const firstEl = testInstance.findByType(FirstField).instance;
    const lastEl = testInstance.findByType(LastField).instance;
    firstEl.props.onChange("jeki");
    expect(onChangeMock).toHaveBeenCalledWith({
      first: "jeki",
      last: "wijaya",
    });
  });
});
