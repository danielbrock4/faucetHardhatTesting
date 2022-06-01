const { expect, assert } = require('chai')
const { ethers } = require('hardhat')

// We then open a describe function. The best way to think of this is just a general function scope that "describes" the suite of test cases enumerated by the "it" functions inside.
describe('This is our main Faucet testing scope', function () {
	// we had to declare the faucet and the signer variables above the before hook and then assign them value within it.
	let faucet, signer

	// The before hook allows us to run logic before we run a consequent series of tests - this is the perfect place to place our contract deployment code
	before('Deploy the contract instance first', async function () {
		// point to contract Faucet
		// A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts, so Faucet here is a factory for instances of our faucet contract
		const contract = await ethers.getContractFactory('Faucet')
		// point to constructor and pass in arguments into deployed to change state variable
		faucet = await contract.deploy({
			/*What we are doing with this change is we are running the exact same contract deployment but we also override the default transaction data to contain a msg.value (value since this is JS) to be 10 ether using the ethers.utils.parseUnits function. 
      		This isn't an argument to the constructor! This is an override of the deployment transaction data, which calls the constructor.*/
			value: ethers.utils.parseUnits('10', 'ether'),
		})
		// deploy contract
		await faucet.deployed()

		// Access all test accounts using ethers.provider.listAccounts() - let [signer, account2, account3] = await ethers.provider.listAccounts()
		;[signer] = await ethers.provider.listAccounts()
	})
	// A lot of the logic in the contract depends on the owner being set correctly in the constructor, so we'll want to test that.
	// Inside that describe, we have an it function. These are your specific unit test targets... just sound it out!: "I want it to x.", "I want it to y.", etc.
	it('it should set the owner to be the deployer of the contract"', async function () {
		// assert.equal function is checking that owner on our deployed Faucet instance is equal to the default signer provided to us by Hardhat
		assert.equal(await faucet.owner(), signer)
	})

	it('should withdraw the right amount', async () => {
		// We are creating withdrawAmount variable equal to 1 ether, which is way over what the require statement in the withdraw() function allows
		let withdrawAmount = ethers.utils.parseUnits('1', 'ether')

		await expect(faucet.withdraw(withdrawAmount)).to.be.reverted
	})
	// the fallback function should be called if the msg to the contract contains no data. It should be testable by checking that the FallbackCalled event is emitted in the logs.
	it('it should invoke the contracts fallback function', async () => {
		// declare a separate ethers signer
		let signer1 = ethers.provider.getSigner(0)
		// create an ethers wallet instance using default signer
		const randomWallet = ethers.Wallet.createRandom()
		const wallet = new ethers.Wallet(randomWallet.privateKey, ethers.provider)

		// send some ETH to our newly created wallet!
		await signer1.sendTransaction({
			to: wallet.address,
			value: ethers.utils.parseUnits('1', 'ether'),
		})

		// send an empty transaction to the faucet
		let response = await wallet.sendTransaction({
			to: faucet.address,
		})
		let receipt = await response.wait()

		// query the logs for the FallbackCalled event
		const topic = faucet.interface.getEventTopic('FallbackCalled')
		const log = receipt.logs.find((x) => x.topics.indexOf(topic) >= 0)
		const deployedEvent = faucet.interface.parseLog(log)

		assert(deployedEvent, 'Expected the Fallback Called event to be emitted!')
	})
})
