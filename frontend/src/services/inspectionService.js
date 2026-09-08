import api from "./api";

/*
 * --------------------------------------------------------
 * ANALYZE INSPECTION
 * --------------------------------------------------------
 *
 * Sends the uploaded package image to Python.
 *
 * Expected backend endpoint:
 *
 * POST /analyze
 *
 * Form data:
 *   image
 *   category
 *   is_imported
 */
export const analyzeInspection = async (image, category, isImported) => {
  if (!image) {
    throw new Error("Inspection image is required.");
  }

  const formData = new FormData();

  formData.append("image", image);

  formData.append("category", category || "");

  formData.append("is_imported", String(Boolean(isImported)));

  const response = await api.post("/analyze", formData, {
    /*
     * Do NOT manually set Content-Type here.
     *
     * Axios/browser will automatically create:
     *
     * multipart/form-data; boundary=...
     */
  });

  return response.data;
};

/*
 * --------------------------------------------------------
 * GET SINGLE INSPECTION
 * --------------------------------------------------------
 *
 * Used by:
 * - Processing page
 * - Inspection result
 * - Inspection details
 */
export const getInspection = async (inspectionId) => {
  if (!inspectionId) {
    throw new Error("Inspection ID is required.");
  }

  const response = await api.get(`/inspections/${inspectionId}`);

  return response.data;
};

/*
 * --------------------------------------------------------
 * GET ALL INSPECTIONS
 * --------------------------------------------------------
 *
 * Used by inspection history.
 */
export const getInspections = async () => {
  const response = await api.get("/inspections");

  return response.data;
};

/*
 * --------------------------------------------------------
 * GET INSPECTION REPORT
 * --------------------------------------------------------
 *
 * Backend should return a PDF.
 */
export const getInspectionReport = async (inspectionId) => {
  if (!inspectionId) {
    throw new Error("Inspection ID is required.");
  }

  const response = await api.get(`/inspections/${inspectionId}/report`, {
    responseType: "blob",
  });

  return response.data;
};
