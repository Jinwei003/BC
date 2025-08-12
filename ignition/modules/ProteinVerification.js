import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProteinVerificationModule", (m) => {
  const proteinVerification = m.contract("ProteinVerification");

  return { proteinVerification };
});