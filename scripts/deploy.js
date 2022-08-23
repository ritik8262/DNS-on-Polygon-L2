const main = async () => {
    const domainContractFactory = await hre.ethers.getContractFactory("Domains")
    const domain = await domainContractFactory.deploy("vibe")
    await domain.deployed()

    console.log("Contract deployed to :", domain.address)

    let txn = await domain.register("ritik", {
        value: hre.ethers.utils.parseEther("1"),
    })
    await txn.wait()
    console.log("Minted domain ritik.vibe")

    txn = await domain.setRecord("ritik", "Am I calm or vibe??")
    await txn.wait()
    console.log("Set record for ritik.vibe")

    const address = await domain.getAddress("ritik")
    console.log("Owner of domain ritik", address)

    const balance = await hre.ethers.provider.getBalance(domain.address)
    console.log("Contract balance:", hre.ethers.utils.formatEther(balance))
}

const runMain = async () => {
    try {
        await main()
        process.exit(0)
    } catch (error) {
        console.error("error", error)
        process.exit(1)
    }
}

runMain()
