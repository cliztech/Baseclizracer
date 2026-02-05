import { Dom } from './dom.mjs';
import { CONFIG } from './config.mjs';

let signer = null;
let contract = null;
let initialized = false;

async function init() {
  if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
    console.warn('No web3 provider found');
    return false;
  }

  if (initialized) return true;

  try {
    // Assumes ethers is loaded globally via CDN
    if (typeof ethers === 'undefined') {
        console.error('Ethers.js not loaded');
        return false;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Request accounts
    await provider.send('eth_requestAccounts', []);

    signer = provider.getSigner();
    contract = new ethers.Contract(CONFIG.contractAddress, [
      'function submitLap(address racer, uint256 time)'
    ], signer);

    initialized = true;
    return true;
  } catch (e) {
    console.error("Failed to init web3", e);
    return false;
  }
}

export const Web3Race = {
  async submitLap(time) {
    if (!initialized) {
        const success = await init();
        if (!success) {
            // Only update status if Dom is available (it should be)
            if (Dom) Dom.set('tx_status', 'Web3 not available');
            return;
        }
    }

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

// Attempt to initialize on load
init();
