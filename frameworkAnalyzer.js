

module.exports = {

	//Transactions Per Second
	analyzeTPS(txconfirmedcount, starttime, endtime) {
		//TPS = Transactions Per Second (txconfirmedcount) During 
		//in a period of time from ti (starttime) to tj (endtime)

		var time_defined = false;

		if (starttime != 0 && endtime != 0) {
			time_defined = true;
		}

		var TPS = txconfirmedcount / (endtime - starttime);

		return {
			TPS: TPS
		}
	},

	//Average Response Delay
	analyzeARD(sumTxInputTxComfirmed, txconfirmedcount) {
		//ARD: Transactions Per Second (txconfirmedcount) during a period of time
		//divided by each transaction sent - each confirmed (sumTxInputTxComfirmed)

		var ARD = sumTxInputTxComfirmed/txconfirmedcount;

		return {
			ARD: ARD
		}
	},

	//Transactions Per CPU
	analyzeTPC(txconfirmedcount, F, CPU) {
		//TPC: Transactions Per Second (txconfirmedcount) during a period of time and
		//F is the frequency of a single CPU core and CPU(t) is the CPU usage 
		//of the blockchain program at t
		
		var TPC = txconfirmedcount / (F * CPU);

		return {
			TPC: TPC
		}
	},

	//Transactions Per Memory Second
	analyzeTPMS(txconfirmedcount, RMEM, VMEM) {
		//where RMEM(t) is the real memory used by the blockchain program
		//at t and VMEM(t) is the virtual memory of it
		
		var TPMS = txconfirmedcount / (RMEM +VMEM);

		return {
			TPMS: TPMS
		}
	},

	//Transactions Per Disk I/O
	analyzeTPDIO(txconfirmedcount, DISKR, DISKW) {
		//where DISKR(t) is the size of the data read from the disk in the
		//second t and DISKW(t) is the size of the data written into the disk.

		var TPDIO = txconfirmedcount / (DISKR + DISKW);

		return {
			TPDIO: TPDIO
		}
	},
	
	//Transactions Per Network Data
	analyzeTPND(txconfirmedcount, UPLOAD, DOWNLOAD) {
		//where UPLOAD(t) is the size of upstream in the network at t and
		//DOWNLOAD(t) is the size of downstream.
		
		var TPND = txconfirmedcount / (UPLOAD + DOWNLOAD);

		return {
			TPND: TPND
		}
	}

}

