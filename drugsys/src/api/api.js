import axios from 'axios';

// Server Port
const API_URL = 'http://localhost:8081';

// Login validation
export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    username: username,
    password: password
  });
  return response.data;
};

// Fetch drugs data
export const fetchDrugs = async () => {
  const response = await axios.get(`${API_URL}/drugs`);
  return response.data;
};

// Fetch statistic data
export const fetchData = async () => {
  const response = await axios.get(`${API_URL}/data`);
  return response.data;
};

// Add drugs
export const addDrugStock = async (id, amount) => {
  const response = await axios.post(`${API_URL}/drugs/${id}/add`, { amount });
  return response.data;
};

// Consume drug
export const consumeDrugStock = async (id, amount) => {
  const response = await axios.post(`${API_URL}/drugs/${id}/consume`, { amount });
  return response.data;
};

// Edit drug
export const editDrug = async (id, editDrugName, editDrugSpecification, editDrugPrice) => {
  const response = await axios.put(`${API_URL}/drugs/${id}`, {
    // 需要将多个请求参数包装成一个对象来传送
    drugName: editDrugName,
    drugSpecification: editDrugSpecification,
    drugPrice: editDrugPrice
  });
  return response.data;
};

// Delete drug
export const deleteDrug = async (id) => {
  const response = await axios.delete(`${API_URL}/drugs/${id}`);
  return response.data;
};

// Create a new drug
export const newDrug = async (newDrugName, newDrugSpecification, newDrugStock, newDrugPrice, num) => {
  const response = await axios.post(`${API_URL}/drugs/new`, {
    // 需要将多个请求参数包装成一个对象来传送
    drugName: newDrugName,
    drugSpecification: newDrugSpecification,
    drugPrice: newDrugPrice,
    stock: newDrugStock,
    used_by_factory: num
  });
  return response.data;
};