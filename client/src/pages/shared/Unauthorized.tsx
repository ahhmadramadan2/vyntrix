import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-red-500">403</h1>
      <p className="text-slate-400 text-lg">
        You don't have permission to view this page
      </p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );
};
