

module.exports = {

	//Transactions Per Second (OK, implemented and working)
	analyzeTPS(txconfirmedcount, starttime, endtime) {
		//TPS = During a period of time from ti to tj , Transactions Per Second of peer
		//we abbreviate transaction as Tx.
		var time_defined = false;

		if (starttime != 0 && endtime != 0) {
			time_defined = true;
		}

		var TPS = txconfirmedcount / (endtime - starttime);

		return {
			TPS: TPS
		}
	},

	//Average Response Delay (OK, implemented and working)
	analyzeARD(sumTxInputTxComfirmed, txconfirmedcount) {
		//ARD: During a period of time from ti to tj, the action of each transaction
		//firstly sent to the peer is marked as Txinput and the action when Tx is confirmed 
		//is marked as Txconfirmed (sumTxInputTxComfirmed). Number of transactions confirmed is txconfirmedcount

		var ARD = sumTxInputTxComfirmed/txconfirmedcount;

		return {
			ARD: ARD
		}
	},

	//Transactions Per CPU (OK, implemented and working)
	analyzeTPC(txconfirmedcount, F, cpuPercent) {
		/*
		TPC: Transactions Per CPU during a period of time from ti to tj (txconfirmedcount), where F is the frequency 
		of a single CPU core and CPU(t) is the CPU usage of the blockchain program at t.
		A velocidade é medida de gigahertz (GHz), e representa um único núcleo do processador. Caso o 
		processador tenha múltiplos núcleos (como a maioria deles), cada um dele terá essa mesma velocidade.
		Neste HP tenho 4 nucleos com 2.53ghz cada. O systeminformation traz a frequencia/speed cpu por core
		mas não traz o percentual de uso.
		*/
		
		var TPC = txconfirmedcount / (F * cpuPercent);

		return {
			TPC: TPC
		}
	},

	//Transactions Per Memory Second
	analyzeTPMS(txconfirmedcount, RMEM, VMEM) {
		//During a period of time from ti to tj (txconfirmedcount), where RMEM(t) is the real memory used 
		//by the blockchain program at t and VMEM(t) is the virtual memory of it
		
		var TPMS = txconfirmedcount / (RMEM +VMEM);

		return {
			TPMS: TPMS
		}
	},

	//Transactions Per Disk I/O
	analyzeTPDIO(txconfirmedcount, DISKR, DISKW) {
		/*
		where DISKR(t) is the size of the data read from the disk in the second t and DISKW(t) 
		is the size of the data written into the disk. Possivel solucao https://systeminformation.io/filesystem.html
		*/

		var TPDIO = txconfirmedcount / (DISKR + DISKW);

		return {
			TPDIO: TPDIO
		}
	},
	
	//Transactions Per Network Data
	analyzeTPND(txconfirmedcount, UPLOAD, DOWNLOAD) {
		//where UPLOAD(t) is the size of upstream in the network at t and
		//DOWNLOAD(t) is the size of downstream. Possivel solucao https://systeminformation.io/network.html
		
		var TPND = txconfirmedcount / (UPLOAD + DOWNLOAD);

		return {
			TPND: TPND
		}
	}

}

