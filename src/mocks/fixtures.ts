import type { Nft, Profile, Wallet } from "@/types/api";

type NftFixtureRow = readonly [
  id: string,
  name: string,
  collection: string,
  creator: string,
  priceEth: string,
  available: number,
  edition: Nft["edition"],
  category: Nft["category"],
];

const nftRows: readonly NftFixtureRow[] = [
  ["emerald-ape-442", "Emerald Ape #442", "Emerald Tribe", "Vinicius Art", "2.49", 1, "unique", "art"],
  [
    "onyx-guardian-218",
    "Onyx Guardian #218",
    "Jungle Keepers",
    "Maya Hash",
    "1.86",
    8,
    "limited",
    "collectible",
  ],
  ["sunset-oracle-071", "Sunset Oracle #071", "Golden Habitat", "Nuno Labs", "3.12", 1, "unique", "art"],
  ["neon-mandrill-908", "Neon Mandrill #908", "Meta Fauna", "Sato Studio", "0.94", 14, "open", "gaming"],
  ["ivory-nomad-133", "Ivory Nomad #133", "Jungle Keepers", "Maya Hash", "1.42", 6, "limited", "collectible"],
  ["savanna-rider-514", "Savanna Rider #514", "Golden Habitat", "Nuno Labs", "2.08", 4, "limited", "gaming"],
  ["turquoise-rebel-829", "Turquoise Rebel #829", "Meta Fauna", "Sato Studio", "4.31", 1, "unique", "art"],
  [
    "sage-emperor-604",
    "Sage Emperor #604",
    "Emerald Tribe",
    "Vinicius Art",
    "1.18",
    9,
    "open",
    "collectible",
  ],
  ["obsidian-scout-311", "Obsidian Scout #311", "Jungle Keepers", "Maya Hash", "0.78", 17, "open", "gaming"],
  ["amber-chief-250", "Amber Chief #250", "Golden Habitat", "Nuno Labs", "5.20", 1, "unique", "art"],
];

export const accountFixtures: ReadonlyArray<{
  profile: Profile;
  password: string;
  wallets: Wallet[];
  favorites: string[];
}> = [
  {
    profile: {
      id: "user-ada",
      name: "Ada Silva",
      email: "ada@jungle.test",
      avatarIndex: 4,
      phone: "+55 11 99999-1234",
      bio: "Colecionadora de arte generativa.",
      country: "Brasil",
    },
    password: "Jungle@123",
    wallets: [
      {
        id: "wallet-ada-1",
        label: "Carteira principal",
        address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        network: "ethereum",
        primary: true,
      },
    ],
    favorites: ["emerald-ape-442"],
  },
  {
    profile: {
      id: "user-caio",
      name: "Caio Santos",
      email: "caio@jungle.test",
      avatarIndex: 6,
      phone: "+55 21 98888-4321",
      bio: "Explorador de mundos digitais.",
      country: "Brasil",
    },
    password: "Jungle@123",
    wallets: [
      {
        id: "wallet-caio-1",
        label: "Polygon Vault",
        address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
        network: "polygon",
        primary: true,
      },
    ],
    favorites: [],
  },
];

export function createNftFixtures(): Nft[] {
  return nftRows.map(([id, name, collection, creator, priceEth, available, edition, category], index) => ({
    id,
    name,
    collection,
    creator,
    priceEth,
    available,
    totalSupply: edition === "unique" ? 1 : edition === "limited" ? 25 : 100,
    edition,
    category,
    imageIndex: index % 8,
    version: 1,
    featured: index < 3,
    description:
      "Uma peça autoral da selva digital, criada para colecionadores que valorizam identidade, escassez e uma história visual marcante. Metadados e propriedade são simulados neste desafio.",
  }));
}
