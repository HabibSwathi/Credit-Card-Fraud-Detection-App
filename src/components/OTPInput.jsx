import { useRef } from "react";
import "./OTPInput.css";

export default function OTPInput({ length = 6, onChange }) {
  const inputsRef = useRef([]);

  const handleInput = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow digit only

    const otpArray = Array.from({ length }, (_, i) =>
      inputsRef.current[i]?.value || ""
    );

    if (value && index < length - 1) {
      inputsRef.current[index + 1].focus();
    }

    const otpString = otpArray.join("");
    onChange(otpString);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !inputsRef.current[index].value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="otp-input-container">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          className="otp-box"
          ref={(el) => (inputsRef.current[index] = el)}
          onInput={(e) => handleInput(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
        />
      ))}
    </div>
  );
}
