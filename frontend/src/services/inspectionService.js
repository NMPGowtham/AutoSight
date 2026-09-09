import api from "./api";

export const createValidation = async () => {
  const response = await api.post("/api/validation/", {});
  return response.data;
};

export const getValidationImages = async (validationId) => {
  if (!validationId) {
    throw new Error("Validation ID is required.");
  }

  const response = await api.get(
    `/api/validation/${validationId}/images`,
  );

  return response.data;
};

export const uploadValidationImage = async (validationId, image) => {
  if (!validationId) throw new Error("Validation ID is required.");
  if (!image) throw new Error("Inspection image is required.");

  const formData = new FormData();
  formData.append("file", image);

  const response = await api.post(
    `/api/validation/${validationId}/images`,
    formData,
  );
  return response.data;
};

export const processValidation = async (validationId) => {
  if (!validationId) throw new Error("Validation ID is required.");

  const response = await api.post(
    `/api/validation/${validationId}/process`,
    {},
    { timeout: 10 * 60 * 1000 },
  );
  return response.data;
};

export const getInspection = async (validationId) => {
  const response = await api.get(`/api/validation/${validationId}`);
  return response.data;
};

export const getInspections = async () => {
  const response = await api.get("/api/validation/");
  return response.data;
};

export const getProcessedInspectionImage = async (validationId) => {
  if (!validationId) {
    throw new Error("Validation ID is required.");
  }

  const response = await api.get(
    `/api/validation/${validationId}/report-data`,
  );

  return response.data?.processed_images?.[0] || null;
};

export const getInspectionReportData = async (validationId) => {
  const response = await api.get(
    `/api/validation/${validationId}/report-data`,
  );
  return response.data;
};

export const generateInspectionReport = async (validationId) => {
  const response = await api.post(`/api/validation/${validationId}/report`);
  return response.data;
};

export const getInspectionReport = async (validationId) => {
  const response = await api.get(
    `/api/validation/${validationId}/report`,
    { responseType: "blob" },
  );
  return response.data;
};

export const reviewValidationResult = async (
  validationId,
  resultId,
  decision,
  comment = "",
) => {
  const response = await api.post(
    `/api/validation/${validationId}/review`,
    {
      result_id: resultId,
      decision,
      comment,
    },
  );
  return response.data;
};
