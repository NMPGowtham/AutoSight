import { Navigate, useParams } from "react-router-dom";

function InspectionDetails() {
  const { inspectionId } = useParams();
  return <Navigate to={`/inspection/${inspectionId}`} replace />;
}

export default InspectionDetails;
