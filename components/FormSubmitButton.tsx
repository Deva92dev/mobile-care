"use client";

import { ComponentProps } from "react";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
} & ComponentProps<"button">;

// ...props , this way it catches all remaining props which don't have explicit names
const FormSubmitButton = ({
  children,
  className,
  ...props
}: FormSubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    // when it is loading disable the button
    <button
      {...props} // rest props declared above of all
      type="submit"
      className={`btn-primary btn ${className}`}
      disabled={pending}
    >
      {pending && <span className="loading loading-spinner " />}
      {children}
    </button>
  );
};

export default FormSubmitButton;
