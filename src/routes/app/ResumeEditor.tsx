import { useParams } from "react-router-dom";

export function ResumeEditor() {
  const { id } = useParams<{ id: string }>();
  return (
    <h1 className="text-3xl font-semibold tracking-tight">Resume {id ?? ""}</h1>
  );
}
