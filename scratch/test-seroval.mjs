import { toJSON, fromJSON } from "seroval";

// Test serializing and deserializing different payloads
try {
  const payload1 = {
    data: {
      bookingRef: "LDT-BK-123456",
      customerName: "Learner",
      customerEmail: "kunal@gmail.com",
      mobile: "9416055858",
      vehicleType: "Car",
      experience: "Beginner",
      date: "2026-10-17",
      time: "10:00",
      message: undefined,
      paymentChoice: "Cash",
    }
  };
  const serialized1 = toJSON(payload1);
  console.log("Payload with undefined:", JSON.stringify(serialized1));
  const deserialized1 = fromJSON(serialized1);
  console.log("Deserialized 1:", deserialized1);
} catch (e) {
  console.error("Error 1:", e);
}

// Test with non-seroval plain JSON
try {
  const plain = {
    data: {
      bookingRef: "LDT-BK-123456",
    }
  };
  console.log("Testing plain JSON in fromJSON...");
  fromJSON(plain);
} catch (e) {
  console.error("Plain JSON error in fromJSON:", e);
}
