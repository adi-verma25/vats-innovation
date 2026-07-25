import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const WORK_ORDERS_COLLECTION = "workOrders";
const COUNTERS_COLLECTION = "counters";
const WORK_ORDER_COUNTER_DOCUMENT = "workOrder";

/**
 * Converts a Firestore timestamp into a JavaScript Date.
 */
const convertTimestampToDate = (timestamp) => {
  if (!timestamp) {
    return null;
  }

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }

  return timestamp;
};

/**
 * Creates the next automatic work-order number.
 *
 * Examples:
 * WO-0001
 * WO-0002
 * WO-0003
 */
export const generateWorkOrderNumber = async () => {
  const counterReference = doc(
    db,
    COUNTERS_COLLECTION,
    WORK_ORDER_COUNTER_DOCUMENT,
  );

  const nextNumber = await runTransaction(
    db,
    async (transaction) => {
      const counterSnapshot = await transaction.get(counterReference);

      let currentNumber = 0;

      if (counterSnapshot.exists()) {
        currentNumber =
          Number(counterSnapshot.data().lastNumber) || 0;
      }

      const newNumber = currentNumber + 1;

      transaction.set(
        counterReference,
        {
          lastNumber: newNumber,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        },
      );

      return newNumber;
    },
  );

  return `WO-${String(nextNumber).padStart(4, "0")}`;
};

/**
 * Creates and saves a new work order.
 */
export const createWorkOrder = async (workOrderData) => {
  if (!workOrderData) {
    throw new Error("Work order data is required.");
  }

  if (!workOrderData.stateId) {
    throw new Error("State is required.");
  }

  if (!workOrderData.districtId) {
    throw new Error("District is required.");
  }

  if (!workOrderData.projectName?.trim()) {
    throw new Error("Project name is required.");
  }

  if (!workOrderData.hospitalName?.trim()) {
    throw new Error("Hospital name is required.");
  }

  if (!workOrderData.department?.trim()) {
    throw new Error("Department is required.");
  }

  if (!workOrderData.startDate) {
    throw new Error("Start date is required.");
  }

  if (!workOrderData.endDate) {
    throw new Error("End date is required.");
  }

  const workOrderNumber = await generateWorkOrderNumber();

  const workOrder = {
    workOrderNumber,

    projectName: workOrderData.projectName.trim(),
    hospitalName: workOrderData.hospitalName.trim(),
    department: workOrderData.department.trim(),
    description: workOrderData.description?.trim() || "",

    stateId: workOrderData.stateId,
    stateName: workOrderData.stateName || "",

    districtId: workOrderData.districtId,
    districtName: workOrderData.districtName || "",

    startDate: workOrderData.startDate,
    endDate: workOrderData.endDate,

    priority: workOrderData.priority || "Medium",
    status: workOrderData.status || "Pending",

    assignedEmployeeIds: [],
    progress: 0,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const documentReference = await addDoc(
    collection(db, WORK_ORDERS_COLLECTION),
    workOrder,
  );

  return {
    id: documentReference.id,
    workOrderNumber,
    ...workOrder,
  };
};

/**
 * Gets all work orders for a particular state and district.
 */
export const getWorkOrdersByDistrict = async (
  stateId,
  districtId,
) => {
  if (!stateId || !districtId) {
    return [];
  }

  const workOrdersQuery = query(
    collection(db, WORK_ORDERS_COLLECTION),
    where("stateId", "==", stateId),
    where("districtId", "==", districtId),
    orderBy("createdAt", "desc"),
  );

  const querySnapshot = await getDocs(workOrdersQuery);

  return querySnapshot.docs.map((workOrderDocument) => {
    const data = workOrderDocument.data();

    return {
      id: workOrderDocument.id,
      ...data,
      createdAt: convertTimestampToDate(data.createdAt),
      updatedAt: convertTimestampToDate(data.updatedAt),
    };
  });
};

/**
 * Gets one work order by its Firestore document ID.
 */
export const getWorkOrderById = async (workOrderId) => {
  if (!workOrderId) {
    throw new Error("Work order ID is required.");
  }

  const documentReference = doc(
    db,
    WORK_ORDERS_COLLECTION,
    workOrderId,
  );

  const documentSnapshot = await getDoc(documentReference);

  if (!documentSnapshot.exists()) {
    throw new Error("Work order was not found.");
  }

  const data = documentSnapshot.data();

  return {
    id: documentSnapshot.id,
    ...data,
    createdAt: convertTimestampToDate(data.createdAt),
    updatedAt: convertTimestampToDate(data.updatedAt),
  };
};

/**
 * Updates an existing work order.
 */
export const updateWorkOrder = async (
  workOrderId,
  updatedData,
) => {
  if (!workOrderId) {
    throw new Error("Work order ID is required.");
  }

  if (!updatedData) {
    throw new Error("Updated work order data is required.");
  }

  const documentReference = doc(
    db,
    WORK_ORDERS_COLLECTION,
    workOrderId,
  );

  const allowedData = {
    projectName: updatedData.projectName?.trim(),
    hospitalName: updatedData.hospitalName?.trim(),
    department: updatedData.department?.trim(),
    description: updatedData.description?.trim() || "",
    startDate: updatedData.startDate,
    endDate: updatedData.endDate,
    priority: updatedData.priority,
    status: updatedData.status,
    progress: updatedData.progress,
    assignedEmployeeIds: updatedData.assignedEmployeeIds,
    updatedAt: serverTimestamp(),
  };

  Object.keys(allowedData).forEach((key) => {
    if (allowedData[key] === undefined) {
      delete allowedData[key];
    }
  });

  await updateDoc(documentReference, allowedData);

  return {
    id: workOrderId,
    ...allowedData,
  };
};

/**
 * Deletes a work order permanently.
 */
export const deleteWorkOrder = async (workOrderId) => {
  if (!workOrderId) {
    throw new Error("Work order ID is required.");
  }

  const documentReference = doc(
    db,
    WORK_ORDERS_COLLECTION,
    workOrderId,
  );

  await deleteDoc(documentReference);

  return workOrderId;
};