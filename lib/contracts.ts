export const SWAN_CONTRACT_ADDRESS = '0x10DBC8eD4a7173a342C5975B8DDA13D15D128870';
export const LLM_ORACLE_COORDINATOR_ADDRESS = '0x01547c5E13Fd80EA6f3b7811acDA51Cf3989f832';

// ABI for the main Swan contract
export const SWAN_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"address","name":"target","type":"address"}],"name":"AddressEmptyCode","type":"error"},
  {"inputs":[{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"ArtifactLimitExceeded","type":"error"},
  {"inputs":[{"internalType":"address","name":"implementation","type":"address"}],"name":"ERC1967InvalidImplementation","type":"error"},
  {"inputs":[],"name":"ERC1967NonPayable","type":"error"},
  {"inputs":[],"name":"FailedCall","type":"error"},
  {"inputs":[],"name":"InvalidInitialization","type":"error"},
  {"inputs":[{"internalType":"enum SwanAgent.Phase","name":"have","type":"uint8"},{"internalType":"enum SwanAgent.Phase","name":"want","type":"uint8"}],"name":"InvalidPhase","type":"error"},
  {"inputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"name":"InvalidPrice","type":"error"},
  {"inputs":[{"internalType":"enum Swan.ArtifactStatus","name":"have","type":"uint8"},{"internalType":"enum Swan.ArtifactStatus","name":"want","type":"uint8"}],"name":"InvalidStatus","type":"error"},
  {"inputs":[],"name":"NotInitializing","type":"error"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
  {"inputs":[{"internalType":"address","name":"artifact","type":"address"},{"internalType":"uint256","name":"round","type":"uint256"}],"name":"RoundNotFinished","type":"error"},
  {"inputs":[],"name":"UUPSUnauthorizedCallContext","type":"error"},
  {"inputs":[{"internalType":"bytes32","name":"slot","type":"bytes32"}],"name":"UUPSUnsupportedProxiableUUID","type":"error"},
  {"inputs":[{"internalType":"address","name":"caller","type":"address"}],"name":"Unauthorized","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"agent","type":"address"}],"name":"AgentCreated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"artifact","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ArtifactListed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"agent","type":"address"},{"indexed":true,"internalType":"address","name":"artifact","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ArtifactRelisted","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"agent","type":"address"},{"indexed":true,"internalType":"address","name":"artifact","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"ArtifactSold","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint64","name":"version","type":"uint64"}],"name":"Initialized","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},
  {"inputs":[],"name":"UPGRADE_INTERFACE_VERSION","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_operator","type":"address"}],"name":"addOperator","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"agentFactory","outputs":[{"internalType":"contract SwanAgentFactory","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"artifactFactory","outputs":[{"internalType":"contract SwanArtifactFactory","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"agent","type":"address"},{"internalType":"uint256","name":"round","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"artifactsPerAgentRound","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"coordinator","outputs":[{"internalType":"contract LLMOracleCoordinator","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint96","name":"_listingFee","type":"uint96"},{"internalType":"uint256","name":"_amountPerRound","type":"uint256"}],"name":"createAgent","outputs":[{"internalType":"contract SwanAgent","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"getCurrentMarketParameters","outputs":[{"components":[{"internalType":"uint256","name":"withdrawInterval","type":"uint256"},{"internalType":"uint256","name":"listingInterval","type":"uint256"},{"internalType":"uint256","name":"buyInterval","type":"uint256"},{"internalType":"uint256","name":"platformFee","type":"uint256"},{"internalType":"uint256","name":"maxArtifactCount","type":"uint256"},{"internalType":"uint256","name":"minArtifactPrice","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint8","name":"maxAgentFee","type":"uint8"}],"internalType":"struct SwanMarketParameters","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_agent","type":"address"},{"internalType":"uint256","name":"_round","type":"uint256"}],"name":"getListedArtifacts","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_artifact","type":"address"}],"name":"getListing","outputs":[{"components":[{"internalType":"uint256","name":"createdAt","type":"uint256"},{"internalType":"uint96","name":"listingFee","type":"uint96"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"address","name":"agent","type":"address"},{"internalType":"uint256","name":"round","type":"uint256"},{"internalType":"enum Swan.ArtifactStatus","name":"status","type":"uint8"}],"internalType":"struct Swan.ArtifactListing","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_artifact","type":"address"}],"name":"getListingPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getMarketParameters","outputs":[{"components":[{"internalType":"uint256","name":"withdrawInterval","type":"uint256"},{"internalType":"uint256","name":"listingInterval","type":"uint256"},{"internalType":"uint256","name":"buyInterval","type":"uint256"},{"internalType":"uint256","name":"platformFee","type":"uint256"},{"internalType":"uint256","name":"maxArtifactCount","type":"uint256"},{"internalType":"uint256","name":"minArtifactPrice","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint8","name":"maxAgentFee","type":"uint8"}],"internalType":"struct SwanMarketParameters[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getOracleFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getOracleParameters","outputs":[{"components":[{"internalType":"uint8","name":"difficulty","type":"uint8"},{"internalType":"uint40","name":"numGenerations","type":"uint40"},{"internalType":"uint40","name":"numValidations","type":"uint40"}],"internalType":"struct LLMOracleTaskParameters","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}
] as const;

// ABI for the Oracle Coordinator
export const LLM_ORACLE_COORDINATOR_ABI = [
  {"inputs":[],"name":"getBestResponse","outputs":[{"components":[{"internalType":"address","name":"responder","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"score","type":"uint256"},{"internalType":"bytes","name":"output","type":"bytes"},{"internalType":"bytes","name":"metadata","type":"bytes"}],"internalType":"struct LLMOracleTask.TaskResponse","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"taskId","type":"uint256"}],"name":"getBestResponse","outputs":[{"components":[{"internalType":"address","name":"responder","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"score","type":"uint256"},{"internalType":"bytes","name":"output","type":"bytes"},{"internalType":"bytes","name":"metadata","type":"bytes"}],"internalType":"struct LLMOracleTask.TaskResponse","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"TaskNotFulfilled","type":"error"},
  {"inputs":[],"name":"InvalidTaskId","type":"error"},
  {"inputs":[],"name":"48f178b8","type":"error"}
] as const;

// ABI for the SwanAgent contract
export const SWAN_AGENT_ABI = [
  {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint96","name":"_listingFee","type":"uint96"},{"internalType":"uint256","name":"_amountPerRound","type":"uint256"},{"internalType":"address","name":"_operator","type":"address"},{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"inputs":[{"internalType":"uint256","name":"have","type":"uint256"},{"internalType":"uint256","name":"want","type":"uint256"}],"name":"BuyLimitExceeded","type":"error"},
  {"inputs":[{"internalType":"uint256","name":"fee","type":"uint256"}],"name":"InvalidFee","type":"error"},
  {"inputs":[{"internalType":"enum SwanAgent.Phase","name":"have","type":"uint8"},{"internalType":"enum SwanAgent.Phase","name":"want","type":"uint8"}],"name":"InvalidPhase","type":"error"},
  {"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"MinFundSubceeded","type":"error"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},
  {"inputs":[],"name":"TaskAlreadyProcessed","type":"error"},
  {"inputs":[],"name":"TaskNotRequested","type":"error"},
  {"inputs":[{"internalType":"address","name":"caller","type":"address"}],"name":"Unauthorized","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"round","type":"uint256"}],"name":"Purchase","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"round","type":"uint256"}],"name":"PurchaseRequest","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"round","type":"uint256"}],"name":"StateRequest","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"round","type":"uint256"}],"name":"StateUpdate","type":"event"},
  {"inputs":[],"name":"amountPerRound","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"createdAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"description","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getRoundPhase","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"enum SwanAgent.Phase","name":"","type":"uint8"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"round","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"inventory","outputs":[{"internalType":"address","name":"artifacts","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"taskId","type":"uint256"}],"name":"isOracleRequestProcessed","outputs":[{"internalType":"bool","name":"isProcessed","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"listingFee","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"marketParameterIdx","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"minFundAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"bytes","name":"_input","type":"bytes"},{"internalType":"bytes","name":"_models","type":"bytes"}],"name":"oraclePurchaseRequest","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"round","type":"uint256"}],"name":"oraclePurchaseRequests","outputs":[{"internalType":"uint256","name":"taskId","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"taskId","type":"uint256"}],"name":"oracleResult","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"bytes","name":"_input","type":"bytes"},{"internalType":"bytes","name":"_models","type":"bytes"}],"name":"oracleStateRequest","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"round","type":"uint256"}],"name":"oracleStateRequests","outputs":[{"internalType":"uint256","name":"taskId","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"purchase","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amountPerRound","type":"uint256"}],"name":"setAmountPerRound","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint96","name":"newListingFee","type":"uint96"}],"name":"setListingFee","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"round","type":"uint256"}],"name":"spendings","outputs":[{"internalType":"uint256","name":"spending","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"state","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"swan","outputs":[{"internalType":"contract Swan","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"treasury","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"updateState","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint96","name":"_amount","type":"uint96"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}
] as const;

// ABI for the SwanArtifact contract
export const SWAN_ARTIFACT_ABI = [
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"description","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"createdAt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
] as const; 