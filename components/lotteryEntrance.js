import { contractAddress, abi } from "../constants";
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { useNotification } from "web3uikit";
import { ethers } from "ethers";

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddress ? contractAddress[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const {runContractFunction: enterRaffle} = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })
        
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
      abi: abi,
      contractAddress: raffleAddress,
      functionName: "getEntranceFee",
      params: {},
    })

     const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
       abi: abi,
       contractAddress: raffleAddress,
       functionName: "getNumberOfPlayers",
       params: {},
     })
    
     const { runContractFunction: getRecentWinner } = useWeb3Contract({
       abi: abi,
       contractAddress: raffleAddress,
       functionName: "getRecentWinner",
       params: {},
     });
    
    async function updateUI() {
      const entranceFeeFromCall = (await getEntranceFee()).toString();
      const numPlayersFromCall = (await getNumberOfPlayers()).toString();
      const recentWinnerFromCall = (await getRecentWinner()).toString();
      setEntranceFee(entranceFeeFromCall);
      setNumPlayers(numPlayersFromCall);
      setRecentWinner(recentWinnerFromCall);
      // console.log(entranceFee)
    }
        
    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()
    }

    const handleNewNotification = function () {
        dispatch({
            type: "success",
            message: "Transaction Complete!!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell"
        })
    }
    
    return (
      <div>
        <h1>Smart Contract Lottery Entrance</h1> <br></br>
            <div>
                <button
                    onClick={async function () {
                        await enterRaffle({
                            onSuccess: handleSuccess,
                            onError: (error) => console.log(error), 
                        })
                    }}
                >
                    Enter Raffle 
                </button>
                Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                Number of Players: {numPlayers}
                Recent Winner: {recentWinner}
            </div>
      </div>
    );

}
