import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-primary-500">404</h1>
      <p className="text-slate-400 text-lg">Page not found</p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );
};
