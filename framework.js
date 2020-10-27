

module.exports = {

	analyzeTPS(txconfirmedcount, starttime, endtime) {

		var time_defined = false;

		if (starttime != 0 && endtime != 0) {
			time_defined = true;
		}

		//Transactions Per Second
		var TPS = txconfirmedcount / (endtime - starttime);

		return {
			TPS: TPS
		}
	},

	analyzeTPC() {
		var sum_tx = analyzeResult.txconfirmedcount;
		var TPC = sum_tx / (sum_cpu * F);
	}

}

