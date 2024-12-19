const express = require('express');
const {Web3} = require('web3');
const dotenv = require('dotenv');
const cors = require('cors')
const GoogleFormArtifact = require('../Backend/abi/FIRManagement.json');
const path = require('path');
dotenv.config();

const CONTRACT_ADDRESS = '0x23C7f3fA7E200Ef94605a6949905fc2aAa747895';
const GANACHE_URL='http://127.0.0.1:7545';
const contractABI = GoogleFormArtifact.abi; 

const app = express();
app.use(express.json());
app.use(cors())

const web3 = new Web3(GANACHE_URL);

const GoogleForm = new web3.eth.Contract(contractABI,CONTRACT_ADDRESS); 



// Police, User, Court, Investiggator


// Middleware to handle JSON parsing
app.use(express.json());

// Helper function to handle BigInt serialization
function safeJSON(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

app.get('/view-all-fir-court', async (req, res) => {
  try {
    const { from } = req.query;

    if (!from) {
      return res.status(400).json({ message: "'from' address is required" });
    }

    const entries = await GoogleForm.methods.viewAllFIRCourt().call({ from });
    res.status(200).send(safeJSON(entries));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get('/view-all-fir-investigate', async (req, res) => {
  try {
    const { from } = req.query;

    if (!from) {
      return res.status(400).json({ message: "'from' address is required" });
    }

    const entries = await GoogleForm.methods.viewAllFIRInvestigator().call({ from });
    res.status(200).send(safeJSON(entries));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// View all FIRs
app.get('/view-all-fir', async (req, res) => {
  try {
    const { from } = req.query;

    if (!from) {
      return res.status(400).json({ message: "'from' address is required" });
    }

    const entries = await GoogleForm.methods.viewAllFIRs().call({ from });
    res.status(200).send(safeJSON(entries));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// View a single FIR
app.get('/view-fir', async (req, res) => {
  try {
    const { from, fir_id } = req.query;

    if (!from || !fir_id) {
      return res.status(400).json({ message: "'from' and 'fir_id' are required" });
    }

    const entry = await GoogleForm.methods.viewFIR(fir_id).call({ from });
    res.status(200).send(safeJSON(entry));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Close an FIR
app.post('/close-fir', async (req, res) => {
  try {
    const { fir_id, message, sender_address } = req.body;

    if (!fir_id || !message || !sender_address) {
      return res.status(400).json({ message: "'fir_id', 'message', and 'sender_address' are required" });
    }

    const result = await GoogleForm.methods.closeFIR(fir_id, message).send({
      from: sender_address,
      gas: 6721975,
      gasPrice: 20000000000,
    });

    res.status(200).send({ message: 'FIR closed successfully', result: safeJSON(result) });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// Mark FIR as investigated
app.post('/investigate-fir', async (req, res) => {
  try {
    const { fir_id, message, sender_address } = req.body;

    if (!fir_id || !message || !sender_address) {
      return res.status(400).json({ message: "'fir_id', 'message', and 'sender_address' are required" });
    }

    const result = await GoogleForm.methods.markAsInvestigated(fir_id, message).send({
      from: sender_address,
      gas: 6721975,
      gasPrice: 20000000000,
    });

    res.status(200).send({ message: 'FIR marked as investigated', result: safeJSON(result) });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// Create a new FIR
app.post('/new-fir', async (req, res) => {
  try {
    const { message, sender_address } = req.body;

    if (!message || !sender_address) {
      return res.status(400).json({ message: "'message' and 'sender_address' are required" });
    }

    const result = await GoogleForm.methods.createFIR(message).send({
      from: sender_address,
      gas: 6721975,
      gasPrice: 20000000000,
    });

    res.status(200).send({ message: 'New FIR created successfully', result: safeJSON(result) });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

// Validate FIR
// Police validating FIR
app.post('/validate-fir', async (req, res) => {
  try {
    const { fir_id, isApproved, message, sender_address } = req.body;

    if (!fir_id || typeof isApproved === 'undefined' || !message || !sender_address) {
      return res.status(400).json({ message: "'fir_id', 'isApproved', 'message', and 'sender_address' are required" });
    }

    const result = await GoogleForm.methods.updateFIRStatus(fir_id, isApproved, message).send({
      from: sender_address,
      gas: 6721975,
      gasPrice: 20000000000,
    });

    res.status(200).send({ message: 'FIR validated successfully', result: safeJSON(result) });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});



// Admin done
app.post('/assign-role', async (req, res) => {
  try {
    const { address, role, sender_address } = req.body;
   
    
    const result = await GoogleForm.methods.assignRole(address, role).send({
      from: sender_address,
      gas: 6721975,
      gasPrice: 20000000000,
    });

    // Ensure any BigInt values in the result are converted to strings
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      )
    );

    res.status(200).send({
      message: 'Role assigned successfully',
      result: serializedResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});