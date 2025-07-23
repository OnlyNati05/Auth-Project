import { CircleCheck } from "lucide-react";

interface FormSuccessProps {
  message?: string;
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;

  return (
    <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-emerald-800">
      <CircleCheck
        style={{ width: "1.2rem", height: "1.2rem", color: "green" }}
      />
      <p>{message}</p>
    </div>
  );
};
