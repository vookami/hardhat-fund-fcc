// function deployFunc() {}

// module.exports.default = deployFunc

// module.exports = async (hre) => {
//     const { getNamedAccounts, deployments } = hre

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("..//utils/verify")
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // different chainId use different address
    // if chainId is X use address Y
    // if chainId is Z use address A
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ertgUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockconfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHSRSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    log("------------------------------------------------")
}
module.exports.tags = ["all", "fundme"]
