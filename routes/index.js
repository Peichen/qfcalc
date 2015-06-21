var express = require('express');
var router = express.Router();
var calc = require('./qcalc');

/* GET home page. */
router.get('/', function(req, res, next) {
    var defaultValue = {
        title: 'Quick Financial Calculator',
        targetValue : 0,
        initialValue : 0,
        periodicalInstallment : 0,
        investmentPeriod : 0,
        vestingType : 'annually',
        returnRate : 5.0,
        inflationRate : 3.0,
        inflationFactor : 'off',
        taxRate : 25.0,
        taxCategory : 'off'
    };
  	res.render('index', defaultValue);
});

router.get('/SolveTarget',function(req,res,next){
    var result = {
        targetValue: req.query.targetValue,
        initialValue : req.query.initialValue,
        periodicalInstallment : req.query.periodicalInstallment,
        investmentPeriod : req.query.investmentPeriod,
        vestingType : req.query.vestingType,
        returnRate : req.query.returnRate,
        inflationRate : req.query.inflationRate,
        inflationFactor : req.query.inflationFactor,
        taxRate : req.query.taxRate,
        taxCategory : req.query.taxCategory
    };
    result.targetValue = calc.getInstance
    (        
        result.initialValue,
        result.periodicalInstallment,
        result.targetValue,
        result.returnRate,
        result.inflationFactor == 'on'?result.inflationRate:0,
        result.investmentPeriod,
        result.taxCategory == "on"?result.taxRate:0  
    ).solveTargetAmount(result.vestingType);
    console.log(result);
    res.send(result);
})

module.exports = router;
