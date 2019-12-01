//BUDGET CONTROLLER
var budgetController = ( function() {

    var Expense = function(id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
			this.percentage = -1;
		};

		Expense.prototype.calPercentage = function(totalIncome) {
			if (totalIncome > 0) {
				this.percentage = Math.round((this.value / totalIncome) * 100);
			} else {
				this.percentage = -1;
			}	
		};

		Expense.prototype.getPercentage = function() {
			return this.percentage;
		};

		var Income = function(id, description, value){
			this.id = id;
			this.description = description;
			this.value = value;
		};

		var calculateTotal = function(type) {
			var sum = 0;
			data.allItems[type].forEach(function(curr){
				sum = sum + curr.value;
			});
			data.totals[type] = sum;
		};

		var data = {
			allItems: {
				exp: [],
				inc: []
				},
			totals: {
				exp: 0,
				inc: 0
			},
			budget: 0,
			percentage: -1
		}

		return {
			addItem: function(type, desc, val){
				var ID, newItem;

				//Create new ID
				if (data.allItems[type].length > 0) {
					ID = data.allItems[type][data.allItems[type].length-1].id + 1;
				} else {
					ID = 0;
				}

				//Create new ID based on 'inc' and 'exp' type
				if (type === 'exp'){
					newItem = new Expense(ID, desc, val);
				} else if (type === 'inc'){
					newItem = new Income(ID, desc, val);
				}

				//push new item to data structure
				data.allItems[type].push(newItem);

				//return new item
				return newItem;
			},

			deleteItem: function(type, id) {
				var ids, index
				ids = data.allItems[type].map(function(current){
					return current.id;
				});

				index = ids.indexOf(id);
				if (index !== -1) {
					data.allItems[type].splice(index, 1);
				}		
			},
			
			calculateBudget: function() {

				//Calculate total incomes and expenses
				calculateTotal('exp');
				calculateTotal('inc');

				//Calculate Budget (incomes - expenses)
				data.budget = data.totals.inc - data.totals.exp;

				//Calculate the percentage of income that we have spent
				if (data.totals.inc > 0) {
					data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
				} else {
					data.percentage = -1;
				}
			},

			calculatePercentage: function(){
				data.allItems.exp.forEach(function(curr) {
					curr.calPercentage(data.totals.inc);
				});			
			},
			
			getPercentage:function(){
				var allPer = data.allItems.exp.map(function(curr){
					return curr.getPercentage();
				});
				return allPer;
			},

			getBudget: function(){
				return {
					budget: data.budget,
					totalInc: data.totals.inc,
					totalExp: data.totals.exp,
					percentage: data.percentage
				}
			},

			testing: function(){
				console.log(data);
			}
		}
		
})();

// UI CONTROLLER
var UIController = ( function() {
		
	var DOMStrings = {
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputVal: '.add__value',
		inputButton: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expenseLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensePercentageLabel: '.item__percentage',
		budgetMonthLabel: '.budget__title--month'
	};
	var formatNumber = function(num, type) {
		var numSplit, int, dec
		/* 
		+ or - before the number
		exactly 2 decimal points
		comma separating the thousands */

		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.');
		int = numSplit[0];

		if(int.length > 3){
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

	};
	var nodeListForEach = function(list, callback) { 
		for(var i = 0; i < list.length; i++){
			callback(list[i], i);
		}
	};
	return {
		getInput: function(){
			return {
				type: document.querySelector(DOMStrings.inputType).value, // inc or exp
				desc: document.querySelector(DOMStrings.inputDesc).value,
				value: parseFloat(document.querySelector(DOMStrings.inputVal).value)
			}
		},
		addListItems: function(object, type){
			var html, newHtml, element;

			//Create html strings with placeholder text
			if (type === 'inc') {
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if(type === 'exp') {
				element = DOMStrings.expenseContainer;
				html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}			

			//Replace placeholder text with actual data
			newHtml = html.replace('%id%', object.id);
			newHtml = newHtml.replace('%description%', object.description);
			newHtml = newHtml.replace('%value%', formatNumber(object.value, type));

			//Insert the HTML into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItems: function(selectorID) {
			var ele = document.getElementById(selectorID);
			ele.parentNode.removeChild(ele);

		},

		clearFields: function() {
			var fields, fieldArr;
			field  = document.querySelectorAll(DOMStrings.inputDesc + ',' + DOMStrings.inputVal);
			fieldArr = Array.prototype.slice.call(field);
			fieldArr.forEach(function(curr, index, array){
				curr.value = '';
			});
			fieldArr[0].focus();
		},

		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			if (obj.percentage> 0) {
				document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentage: function(percentages) {
			var fields = document.querySelectorAll(DOMStrings.expensePercentageLabel);

		
			nodeListForEach(fields, function(current, index) {
				if(percentages[index] > 0) {
					current.textContent = percentages[index] + '%';	
				}else {
					current.textContent = '---';
				}
			});
		},

		displayMonth: function(){
			var now, year, month, months;
			now = new Date();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
		'October', 'November', 'December'];
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMStrings.budgetMonthLabel).textContent = months[month] + ' ' + year;

		},

		changedType: function() {
			var fields =  document.querySelectorAll(
				DOMStrings.inputType + ',' +
				DOMStrings.inputDesc + ',' +
				DOMStrings.inputVal
			);

			nodeListForEach(fields, function(curr){
				curr.classList.toggle('red-focus');
			});

			document.querySelector(DOMStrings.inputButton).classList.toggle('red');
		},

		getDomStrings: function() {
			return DOMStrings;
		}
	};
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

		var setupEventListeners = function() {
			var DOM = UICtrl.getDomStrings();

			document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);

    	document.addEventListener('keypress', function(event){
        if (event.keyCode == 13) {
            ctrlAddItem();
        }
			});
			document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
			document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
		}

		
		var updateBudget = function() {
			var budget;
			//Calculate the budget
			budgetCtrl.calculateBudget();

			//Return the budget
			budget = budgetCtrl.getBudget();

			//Display the budget on the UI
			UICtrl.displayBudget(budget);
		}

		var updatePercentage = function() {
			var per;
			//Calculate Percantage
			budgetCtrl.calculatePercentage()
			//get the percentage
			per = budgetCtrl.getPercentage();
			//display the percentage in UI
			UICtrl.displayPercentage(per);
		}
	  
		var ctrlAddItem = function() {
			var input, newItem;
			
			// Get the field input data
			input = UICtrl.getInput();
			
			if ( input.desc !== "" && !isNaN(input.value) && input.value > 0) {
				// Add new item to budget app
				newItem = budgetCtrl.addItem(input.type, input.desc, input.value);

				// Add new Item to UI
				UICtrl.addListItems(newItem, input.type);

				//Clear the fields
				UICtrl.clearFields();

				//Calculate and update budget
				updateBudget();

				//update percentage
				updatePercentage();
			}
		};

		var ctrlDeleteItem = function(event) {
			var itemID;
			itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
			if (itemID) {
				splitID = itemID.split('-');
				type = splitID[0];
				ID = parseInt(splitID[1]);
			}

			//1.Delete Item from datastructure
			budgetCtrl.deleteItem(type, ID);
			//2.Delete the item from UI 
			UICtrl.deleteListItems(itemID);
			//3.Update and show the new budget
			updateBudget();
			//update percentage
			updatePercentage();
		};

		return {
			init: function(){
				console.log('Application started');
				UICtrl.displayMonth();
				UICtrl.displayBudget({
					budget: 0,
					totalInc: 0,
					totalExp: 0,
					percentage: 0
				});
				setupEventListeners();
			}
		}

})(budgetController, UIController);

controller.init();