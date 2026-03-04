(function(){
  if (typeof window.ethereum === 'undefined') {
    console.warn('No web3 provider found');
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  provider.send('eth_requestAccounts', []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONFIG.contractAddress, [
    'function submitLap(address racer, uint256 time)'
  ], signer);

  window.Web3Race = {
    async submitLap(time) {
      try {
        Dom.set('tx_status', 'Submitting lap...');
        const addr = await signer.getAddress();
        const tx = await contract.submitLap(addr, time);
        Dom.set('tx_status', 'Tx pending: ' + tx.hash);
        const receipt = await tx.wait();
        Dom.set('tx_status', 'Lap submitted, block ' + receipt.blockNumber);
      } catch (err) {
        Dom.set('tx_status', 'Tx failed: ' + (err.message || err));
      }
    }
  };
})();
