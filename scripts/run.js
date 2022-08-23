const main = async () => {
    const [owner, superCoder] = await hre.ethers.getSigners()
    const domainContractFactory = await hre.ethers.getContractFactory("Domains")
    const domain = await domainContractFactory.deploy("vibe")
    await domain.deployed()

    // console.log("Contract deployed to:", domain.address)
    // console.log("Contract deployed by: ", owner.address)
    console.log("Contract owner:", owner.address)

    let txn = await domain.register("abc", {
        value: hre.ethers.utils.parseEther("10"),
    })
    await txn.wait()

    // const address = await domain.getAddress("abc")
    // console.log("Owner of domain mortal: ", address)

    const balance = await hre.ethers.provider.getBalance(domain.address)
    console.log("Contract Balance: ", hre.ethers.utils.formatEther(balance))

    try {
        txn = await domain.connect(superCoder).withdraw()
        await txn.wait()
    } catch {
        console.log("Could not rob Contract")
    }

    let ownerBalance = await hre.ethers.provider.getBalance(owner.address)
    console.log(
        "Balance of owner before withdrawal: ",
        hre.ethers.utils.formatEther(ownerBalance)
    )

    txn = await domain.connect(owner).withdraw()
    await txn.wait()

    const contractBalance = await hre.ethers.provider.getBalance(domain.address)
    ownerBalance = await hre.ethers.provider.getBalance(owner.address)

    console.log(
        "Contract balance after withdrawal:",
        hre.ethers.utils.formatEther(contractBalance)
    )
    console.log(
        "Balance of owner after withdrawal:",
        hre.ethers.utils.formatEther(ownerBalance)
    )
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
