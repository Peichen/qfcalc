/**
 * New node file
 */
var exports = module.exports = {};
exports.getInstance = function(
		initialAmount,
		periodicalAmount,
		targetAmount,
		ratePercentage,
		inflationPercentage,
		vestingPeriod,
		taxRatePercentage) {
	this.initialAmount = initialAmount * 1.0;
	this.periodicalAmount = periodicalAmount * 1.0;
	this.targetAmount = targetAmount * 1.0;
	this.ratePercentage = ratePercentage * 1.0;
	this.inflationPercentage = inflationPercentage * 1.0;
	this.vestingPeriod = vestingPeriod * 1.0;
	this.taxRatePercentage = taxRatePercentage || 0.0;
	this.taxRatePercentage *= 1.0;
	this.solveTargetAmount = function(investOption) {
		var factor = getFactor(investOption);
		var newRatePercentage = this.ratePercentage/factor;
		var newInflationPercentage = inflationPercentage / factor
        var newVestingPeriod = vestingPeriod * factor
        var afterTax = (100-this.taxRatePercentage)/100.0
        // NOTE: compound interest
        var effectRate = (1.0+newRatePercentage*afterTax/100.0-newInflationPercentage/100.0)
        var compound = initialAmount*Math.pow(effectRate, newVestingPeriod)
        // NOTE: periodical installment
        var accumulatedInstallment = 0
        if (effectRate != 1) {
            var gain = (Math.pow(effectRate,(newVestingPeriod))-1)/(effectRate-1)
            accumulatedInstallment = (periodicalAmount/(factor)) * gain
        } else {
            accumulatedInstallment = (periodicalAmount/(factor)) * (newVestingPeriod)
        }
        return compound+accumulatedInstallment        
	}
	this.solvePeriodicalAmount=function(option){
        var calc0 = this.getInstance(this.initialAmount,0,  0, this.ratePercentage, this.inflationPercentage, this.vestingPeriod, this.taxRatePercentage);
        var compound = calc0.solveTargetAmount(option);
        var factor = getFactor(option);
        var newRatePercentage = ratePercentage / factor;
        var newInflationPercentage = inflationPercentage / factor;
        var newVestingPeriod = vestingPeriod * factor;
        var gain = 0;
        var afterTax = (100-this.taxRatePercentage)/100.0;
        var effectRate = (1.0+newRatePercentage*afterTax/100.0-newInflationPercentage/100.0);
        if (effectRate != 1 ) {
            gain = (Math.pow(effectRate,(newVestingPeriod))-1)/(effectRate-1);
        } else {
            gain = Double(newVestingPeriod);
        }
        return (targetAmount-compound)/gain*(factor);
	}
	this.solveInitialAmount = function(option) {
        var calc0 = this.getInstance(
        		0, 
        		this.periodicalAmount,
        		0,
        		this.ratePercentage, 
        		this.inflationPercentage, 
        		this.vestingPeriod,
        		this.taxRatePercentage
        		);
        var accumulatedInstallment = calc0.solveTargetAmount(option);
        var factor = getFactor(option);
        var newRatePercentage = ratePercentage / factor;
        var newInflationPercentage = inflationPercentage / factor;
        var newVestingPeriod = vestingPeriod * factor;
        var afterTax = (100-this.taxRatePercentage)/100.0;
        var effectRate = (1.0+newRatePercentage*afterTax/100.0-newInflationPercentage/100.0);
        return (targetAmount-accumulatedInstallment)/Math.pow(effectRate, newVestingPeriod);
    }
	this.solveVestingPeriod = function(option) {
        var factor = getFactor(option);
        var rawPeriod = 0.0;
        var newRatePercentage = ratePercentage / (factor);
        var newInflationPercentage = inflationPercentage / (factor);
        var newPeriodAmount = periodicalAmount / (factor);
        var afterTax = (100-this.taxRatePercentage)/100.0;
        var effectRate = (1.0+newRatePercentage*afterTax/100.0-newInflationPercentage/100.0);
        if (effectRate != 1) {
            rawPeriod = (Math.log((targetAmount*(effectRate-1)+newPeriodAmount))-Math.log(initialAmount*effectRate-initialAmount+newPeriodAmount))/Math.log(effectRate);
        } else if (effectRate < 1) {
            rawPeriod = 0.0;
        } else {
            rawPeriod = (targetAmount - initialAmount)/periodicalAmount;
        }
        return (rawPeriod)/(factor);
    }
	this.solveRatePercentage = function(option) {
        var rate = 0.0;
        if (vestingPeriod == 0) {
            rate = 0.0;
        } else if (periodicalAmount != 0) {
            var rateInc = 0.1;
            var calc1 = this.getInstance
            		(this.initialAmount
            		,this.periodicalAmount
            		,0.0
            		,rate
            		,this.inflationPercentage
            		,this.vestingPeriod
            		);
            while (calc1.solveTargetAmount(option) < targetAmount) {
                rate+=rateInc;
                calc1 = this.getInstance
                		(this.initialAmount
                		,this.periodicalAmount
                		,0.0
                		,rate
                		,this.inflationPercentage
                		,this.vestingPeriod
                		);
            }
        } else if (initialAmount != 0) {
            var factor = getFactor(option)
            var newVestingPeriod = vestingPeriod * factor
            var effectRate = Math.pow(10.0,Math.log(targetAmount/initialAmount)/newVestingPeriod/Math.log(10.0))
            rate = (effectRate - 1.0 + inflationPercentage*(factor)/100.0)*100.0*(factor)
        }
        var afterTax = (100-this.taxRatePercentage)/100.0
        return rate/afterTax
	}    
	getFactor = function(investOption) {
		if (investOption=="monthly") {
			return 12.0;
		} else if (investOption=="quarterly") {
			return 4.0;
		}
		return 1.0;
	}
	
	return this;
}