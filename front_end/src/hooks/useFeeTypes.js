import { useCallback } from "react";
import { useAxiosInstance } from "./useAxiosInstance";

export const useFeeTypes = () => {
	const axios = useAxiosInstance();

	const getAllFeeTypes = useCallback(async () => {
		try {
			const res = await axios.get("/FeeTypes");
			return Array.isArray(res.data) ? res.data : res.data?.data || [];
		} catch (err) {
			console.error("useFeeTypes.getAllFeeTypes error", err);
			throw err;
		}
	}, [axios]);

	const getExtraFeesByOrder = useCallback(
		async (orderId) => {
			try {
				if (!orderId) return [];
				const res = await axios.get("/ExtraFee", { params: { order_id: orderId } });
				return Array.isArray(res.data) ? res.data : res.data?.data || [];
			} catch (err) {
				console.error("useFeeTypes.getExtraFeesByOrder error", err);
				throw err;
			}
		},
		[axios]
	);

	const createExtraFee = useCallback(
		async (orderId, feeTypeId, description = "") => {
			try {
				const payload = {
					orderId,
					FeeType_id: feeTypeId,
					description,
				};
				const res = await axios.post("/ExtraFee", payload);
				return res.data;
			} catch (err) {
				console.error("useFeeTypes.createExtraFee error", err);
				throw err;
			}
		},
		[axios]
	);

	const deleteExtraFee = useCallback(
		async (feeId) => {
			try {
				const res = await axios.delete(`/ExtraFee/${feeId}`);
				return res.data;
			} catch (err) {
				console.error("useFeeTypes.deleteExtraFee error", err);
				throw err;
			}
		},
		[axios]
	);

	return {
		getAllFeeTypes,
		getExtraFeesByOrder,
		createExtraFee,
		deleteExtraFee,
	};
};

export default useFeeTypes;

