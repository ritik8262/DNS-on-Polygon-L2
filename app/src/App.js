import React, { useEffect, useState } from "react"
import "./styles/App.css"
import twitterLogo from "./assets/twitter-logo.svg"
import {  ethers } from "ethers"
import contractAbi from "./utils/contractABI.json"
import polygonLogo from "./assets/polygonlogo.png"
import ethLogo from "./assets/ethlogo.png"
import { networks } from "./utils/networks"

// Constants
const TWITTER_HANDLE = "Veer35084137"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
const tld = ".vibe"
const CONTRACT_ADDRESS = "0xe852926Cc77BB16DE8f464a3857fE95C7c91b953"

const App = () => {
    const [network, setNetwork] = useState("")
    const [currentAccount, setCurrentAccount] = useState("")
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mints, setMints] = useState([])

    const [domain, setDomain] = useState("")
    const [record, setRecord] = useState("")

    const connectWallet = async () => {
        try {
            const { ethereum } = window

            if (!ethereum) {
                alert("Get Metamask -> https://metamask.io/")
                return
            }

            const accounts = await ethereum.request({
                method: "eth_requestAccounts",
            })

            console.log("Connected", accounts[0])
            setCurrentAccount(accounts[0])
        } catch (error) {
            console.log(error)
        }
    }

    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window

        if (!ethereum) {
            console.log("Make sure you have Metamask!")
            return
        } else {
            console.log("We have the ethereum object", ethereum)
        }

        const accounts = await ethereum.request({ method: "eth_accounts" })

        if (accounts.length !== 0) {
            const account = accounts[0]
            console.log("Found an authorised account:", account)
            setCurrentAccount(account)
        } else {
            console.log("No authorised account found")
        }

        const chainId = await ethereum.request({ method: "eth_chainId" })
        setNetwork(networks[chainId])

        ethereum.on("chainChanged", handleChainChanged)

        function handleChainChanged(_chainId) {
            window.location.reload()
        }
    }

    const switchNetwork = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: "0x13881" }],
                })
            } catch (error) {
                if (error.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: "wallet_addEthereumChain",
                            params: [
                                {
                                    chainId: "0x13881",
                                    chainName: "Polygon Mumbai Testnet",
                                    rpcUrls: [
                                        "https://rpc-mumbai.maticvigiil.com/",
                                    ],
                                    nativeCurrency: {
                                        name: "Mumbai Matic",
                                        symbol: "MATIC",
                                        decimals: 18,
                                    },
                                    blockExplorerUrls: [
                                        "https://mumbai.polygonscan..com/",
                                    ],
                                },
                            ],
                        })
                    } catch (error) {
                        console.log(error)
                    }
                }
                console.log(error)
            }
        } else {
            alert(
                "Metamask is not installed. Please install it to use this app: https://metamsk.io/download.html"
            )
        }
    }

    const mintDomain = async () => {
        if (!domain) {
            return
        }

        if (domain.length < 3) {
            alert("Domain must be at least 3 characters long")
            return
        }

        const price =
            domain.length === 3 ? "0.5" : domain.length === 4 ? "0.3" : "0.1"
        console.log("Minting domain", domain, "with price", price)

        try {
            const { ethereum } = window
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const contract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    contractAbi.abi,
                    signer
                )

                console.log("Going to pop wallet now to pay gas...")

                let tx = await contract.register(domain, {
                    value: ethers.utils.parseEther(price),
                })
                const reciept = await tx.wait()

                if (reciept.status === 1) {
                    console.log(
                        "Record set! https://mumbai.polygonscan.com/tx/" +
                            tx.hash
                    )

                    tx = await contract.setRecord(domain, record)
                    await tx.wait()
                    console.log(
                        "Record set! https://mumbai.polygonscan.com/tx/" +
                            tx.hash
                    )

                    setTimeout(() => {
                        fetchMints()
                    }, 2000)

                    setRecord("")
                    setDomain("")
                } else {
                    alert("Transaction failed! Please try again")
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchMints = async () => {
        try {
            const { ethereum } = window
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const contract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    contractAbi.abi,
                    signer
                )

                const names = await contract.getAllNames()

                const mintRecords = await Promise.all(
                    names.map(async (name) => {
                        const mintRecord = await contract.records(name)
                        const owner = await contract.domains(name)
                        return {
                            id: names.indexOf(name),
                            name: name,
                            record: mintRecord,
                            owner: owner,
                        }
                    })
                )
                console.log("MINTS FETCHED", mintRecords)
                setMints(mintRecords)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (network === "PolygonMumbai Testnet") {
            fetchMints()
        }
    }, [currentAccount, network])

    const updateDomain = async () => {
        if (!record || !domain) {
            return
        }
        setLoading(true)
        console.log("Updating domain", domain, "with record", "record")
        try {
            const { ethereum } = window
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const contract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    contractAbi.abi,
                    signer
                )

                let tx = await contract.setRecord(domain, record)
                await tx.wait()
                console.log(
                    "Record set https://mumbai.polygonscan.com/tx/" + tx.hash
                )
                fetchMints()
                setRecord("")
                setDomain("")
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    const renderNotConnectedContainer = () => (
        <div className="connect-wallet-container">
            <img
                src="https://media.giphy.com/media/15wC7XdIXN5q8o6fr9/giphy-downsized.gif"
                alt="Vibing Cat gif"
            />
            <button
                onClick={connectWallet}
                className="cta-button connect-wallet-button"
            >
                Connect Wallet
            </button>
        </div>
    )

    const renderInputForm = () => {
        if (network !== "Polygon Mumbai Testnet") {
            return (
                <div className="connect-wallet-container">
                    <h2>Please connect to the Polygon Mumbai Testnet</h2>
                    <button
                        className="cta-button mint-button"
                        onClick={switchNetwork}
                    >
                        Click here to switch
                    </button>
                </div>
            )
        }
        return (
            <div className="form-container">
                <div className="first-row">
                    <input
                        type="text"
                        value={domain}
                        placeholder="domain"
                        onChange={(e) => setDomain(e.target.value)}
                    />
                    <p className="tld">{tld}</p>
                </div>
                <input
                    type="text"
                    value={record}
                    placeholder="whats ur vibing style"
                    onChange={(e) => setRecord(e.target.value)}
                />
                {editing ? (
                    <div className="button-container">
                        <button
                            className="cta-button mint-button"
                            disabled={loading}
                            onClick={updateDomain}
                        >
                            Set Record
                        </button>

                        <button
                            className="cta-button mint-button"
                            onClick={() => {
                                setEditing(false)
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        className="cta-button mint-button"
                        disabled={loading}
                        onClick={mintDomain}
                    >
                        Mint
                    </button>
                )}
                {/* <div className="button-container">
                    <button
                        className="cta-button mint-button"
                        onClick={mintDomain}
                    >
                        Mint
                    </button>
                    <button
                        className="cta-button mint-button"
                        disabled={null}
                        onClick={null}
                    >
                        Set data
                    </button>
                </div> */}
            </div>
        )
    }

    useEffect(() => {
        checkIfWalletIsConnected()
    }, [])

    const renderMints = () => {
        if (currentAccount && mints.length > 0) {
            return (
                <div className="mint-container">
                    <p className="subtitle">Recently minted domains!</p>
                    <div className="mint-list">
                        {mints.map((mint, index) => {
                            return (
                                <div className="mint-item" key={index}>
                                    <div className="mint-row">
                                        <a
                                            className="link"
                                            href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`}
                                            target="_blank"
                                            rel="noopener nonreferrer"
                                        >
                                            <p className="underlined">
                                                {" "}
                                                {mint.name}
                                                {tld}{" "}
                                            </p>
                                        </a>
                                        {mint.owner.toLowerCase() ===
                                        currentAccount.toLowerCase() ? (
                                            <button
                                                className="edit-button"
                                                onClick={() =>
                                                    editRecord(mint.name)
                                                }
                                            >
                                                <img
                                                    className="edit-icon"
                                                    src="https://img.icons8.com/metro/26/000000/pencil.png"
                                                    alt="Edit button"
                                                />
                                            </button>
                                        ) : null}
                                    </div>
                                    <p> {mint.record} </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }
    }

    const editRecord = (name) => {
        console.log("Editing record for", name)
        setEditing(true)
        setDomain(name)
    }

    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <header>
                        <div className="left">
                            <p className="title">💫 Vibe Name Service💫</p>
                            <p className="subtitle">
                                Your immortal API on the blockchain!
                            </p>
                        </div>
                        <div className="right">
                            <img
                                alt="Network logo"
                                className="logo"
                                src={
                                    network.includes("Polygon")
                                        ? polygonLogo
                                        : ethLogo
                                }
                            />
                            {currentAccount ? (
                                <p>
                                    Wallet: {currentAccount.slice(0, 6)}...
                                    {currentAccount.slice(-4)}
                                </p>
                            ) : (
                                <p>Not connected</p>
                            )}
                        </div>
                    </header>
                </div>

                {!currentAccount && renderNotConnectedContainer()}
                {(currentAccount, renderInputForm())}
                {mints && renderMints()}

                <div className="footer-container">
                    <img
                        alt="Twitter Logo"
                        className="twitter-logo"
                        src={twitterLogo}
                    />
                    <a
                        className="footer-text"
                        href={TWITTER_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >{`built with @${TWITTER_HANDLE}`}</a>
                </div>
            </div>
        </div>
    )
}

export default App
