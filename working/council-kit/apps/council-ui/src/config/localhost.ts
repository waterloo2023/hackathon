import { CouncilConfig } from "src/config/CouncilConfig";

export const localhostCouncilConfig: CouncilConfig = {
  version: "",
  chainId: 31337,
  timelock: {
    address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
  },
  coreVoting: {
    name: "Core Voting",
    address: "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512",
    descriptionURL: "https://moreinfo.com",
    vaults: [
      {
        name: "Locking Vault",
        address: "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9",
        type: "LockingVault",
        descriptionURL: "https://moreinfo.com",
      },
      // {
      //   name: "Vesting Vault",
      //   address: "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
      //   type: "VestingVault",
      //   descriptionURL: "https://moreinfo.com",
      // },
    ],
    proposals: {},
  },

  // gscVoting: {
  //   name: "GSC",
  //   address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  //   descriptionURL: "https://moreinfo.com",
  //   vaults: [
  //     {
  //       name: "GSC Vault",
  //       address: "0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE",
  //       type: "GSCVault",
  //       descriptionURL: "https://moreinfo.com",
  //     },
  //   ],
  //   proposals: {},
  // },
};
