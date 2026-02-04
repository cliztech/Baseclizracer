async function connectWallet() {
  if (!window.ethereum) {
    alert('MetaMask not detected');
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  try {
    await provider.send('eth_requestAccounts', []);
    const network = await provider.getNetwork();
    if (network.chainId !== 8453 && network.chainId !== 84531) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x2105' }]
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base Mainnet',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org']
            }]
          });
        } else {
          throw switchError;
        }
      }
    }
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    document.getElementById('walletAddress').textContent = addr;
    window.signer = signer;
  } catch (err) {
    console.error(err);
    alert('Failed to connect wallet');
  }
}

async function signPlay() {
  if (!window.signer) {
    alert('Connect wallet first');
    return;
  }
  const message = 'Playing Base Racer at ' + new Date().toISOString();
  try {
    const signature = await window.signer.signMessage(message);
    console.log('Signature', signature);
    alert('Play session signed!');
  } catch (err) {
    console.error(err);
    alert('Signing failed');
  }
}

window.connectWallet = connectWallet;
window.signPlay = signPlay;
