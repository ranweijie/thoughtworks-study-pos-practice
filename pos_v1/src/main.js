//TODO: Please write code in this file.

function printInventory(inputs) {
	// alert(JSON.stringify(inputs));

	// 转换inputs格式
	var singleFormatInputs = getSingleFormatInputs(inputs);
	// alert(JSON.stringify(singleFormatInputs));

	// 计算所购商品数量
	var buyedBarcodes = getBuyedBarcodes(singleFormatInputs);
	// alert(JSON.stringify(buyedBarcodes));

	// 获取购买商品明细items
	var buyedItems = getBuyedItems(buyedBarcodes);
	// alert("mai1"+JSON.stringify(buyedItems));

	// 获取赠送商品明细
	var giftItems = getGiftItems(buyedItems);
	// alert("song:"+JSON.stringify(giftItems));

	var paidItems = getPaidInfo(buyedItems,giftItems);

	// 计算总花费和总节省
	var summary = getTotalCostAndTotalSave(paidItems);

	// 设置购物清单内容
	var shoppListString = getShoppListString(paidItems,giftItems,summary)

	// 打印购物清单
	console.log(shoppListString)
}


// 1 转换格式inputs
function getSingleFormatInputs(inputs){
	var changedArray = _.map(inputs,function (item) {
		if (item.indexOf("-") == -1){
			return item;
		}else{
			var element = item.split("-")[0];
			var count = Number(item.split("-")[1]);
			return _.times(count,_.constant(element));
		}
	});
	changedArray = _.flattenDeep(changedArray);
	return changedArray;
}


// 2 计算数量
function getBuyedBarcodes(inputs){
	var countedArray = _.countBy(inputs);
	var resultArray = _.transform(countedArray,function (result,value,key) {
		result.push({"barcode":key,"count":value})
	},[]);
	return resultArray;
}

// 3 购物明细 barcode,name,unit,price,count
function getBuyedItems(inputs){
	var allSoldItems = loadAllItems();
	var buyedItemInfo = _.map(inputs,function (buyedItem) {
		var needItem =_.filter(allSoldItems,function (soldItem) {
			return soldItem.barcode == buyedItem.barcode;
		});
		// alert(JSON.stringify(needItem));
		needItem[0]["count"] = buyedItem.count;
		return needItem[0];
	});
	return buyedItemInfo;
}

// 4 计算优惠情况（买二送一）
function getGiftItems(inputs){
	var buyedItems = _.cloneDeep(inputs);
	var promotionsInfo = loadPromotions();
	var	allBuy2Get1FreeInfo = _.find(promotionsInfo,function (promotionItem) {
		return promotionItem.type == "BUY_TWO_GET_ONE_FREE";
	});

	var allBuy2Get1FreeBarcodes = allBuy2Get1FreeInfo.barcodes;
	var giftItems =_.filter(buyedItems,function (buyedItem) {
		return _.indexOf(allBuy2Get1FreeBarcodes,buyedItem.barcode) != -1;
	});

	giftItems = _.map(giftItems,function (gitfItem) {
		gitfItem.count = parseInt(gitfItem.count/3);
		return gitfItem;
	});
	// alert(JSON.stringify(inputs));
	return giftItems;
}

// 5 计算付款明细
function getPaidInfo(buyedGoods,giftGoods){
	var paidInfo = _.map(buyedGoods,function (buyedItem) {
		var giftInfo =  _.find(giftGoods,function (giftGoodsItem) {
			return giftGoodsItem.barcode == buyedItem.barcode;
		});
		var paidCount = buyedItem.count;
		if(giftInfo){
			paidCount = paidCount - giftInfo.count;
		}
		buyedItem.subTotal = paidCount * buyedItem.price;
		return buyedItem;
	});
	// alert(JSON.stringify(paidInfo));
	return paidInfo;
}

//6 计算总花费和总节省
function getTotalCostAndTotalSave(paidItems) {
	var TotalCostAndTotalSave = {},
		totalCost = _.sumBy(paidItems,function (paidItem) {
			return paidItem.subTotal;
		}),
		totalSave = _.sumBy(paidItems,function (paidItem) {
			return paidItem.count * paidItem.price - paidItem.subTotal;
		});
	// console.log("totalCost:",totalCost,"totalSave:",totalSave);
	return {"total":totalCost,"save":totalSave}
}

// 7设置购物清单内容
function getShoppListString(paidItems,giftItems,summaryItems) {
	// console.log(paidItems,giftItems,summaryItems);
	var paidItemsString,giftItemsString,summaryString,shoppListString;
	var paidItemsArray = _.map(paidItems,function (paidItem) {
		return "名称:"+ paidItem.name +",数量:"+paidItem.count+paidItem.unit+",单价:"+paidItem.price+"(元)，小计："+paidItem.subTotal+"(元)"
	});
	paidItemsString = paidItemsArray.join("\n");
	paidItemsString += "\n----------------------\n";

	var giftItemsArray = _.map(giftItems,function (giftItem) {
		return "名称:"+ giftItem.name +",数量:"+giftItem.count+giftItem.unit;
	});
	giftItemsString = paidItemsArray.join("\n");
	giftItemsString = "挥泪赠送商品：\n" + giftItemsString;
	giftItemsString += "\n----------------------\n";

	summaryString = "总计:"+ summaryItems.total +"(元)\n节省：" + summaryItems.save + "(元)";

	shoppListString = "***<没钱赚商店>购物清单***\n" + paidItemsString + giftItemsString + summaryString;
	shoppListString += "\n**********************";
	// console.log(shoppListString);
	return shoppListString;
}