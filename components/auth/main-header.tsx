import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface MainHeaderProps {
  label: string;
}

export const MainHeader = ({ label }: MainHeaderProps) => {
  return (
    <div className="w-full flex flex-col my-2 items-center justify-center">
      <h1 className={cn("text-3xl font-semibold", font.className)}>{label}</h1>
    </div>
  );
};
