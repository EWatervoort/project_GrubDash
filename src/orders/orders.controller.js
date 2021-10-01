const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req, res) {
  res.json({ data: orders });
};

function orderExists(req, res, next) {
  const { orderId } = req.params
  const foundOrder = orders.find((order) => order.id === orderId)
  if (foundOrder) {
    res.locals.order = foundOrder
    return next()
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`
  })
}

function bodyHasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a deliverTo",
  });
};

function bodyHasMobileNumber(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber",
  });
};

function bodyHasDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include a dish",
  });
};

function bodyHasQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  let failingDish;
  dishes.forEach((dish, index) => {
    if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
      failingDish = index;
    }
  });
  if (failingDish !== undefined) {
    return next({
      status: 400,
      message: `Dish ${failingDish} must have a quantity that is an integer greater than 0`,
    });
  } else {
    next();
  }
};


function bodyHasDishesArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes) && dishes.length !== 0) {
    return next();
  }
  next({
    status: 400,
    message: "Order must include at least one dish",
  });
};

function orderId(req, res, next) {
  const { data: { id } = {} } = req.body;
  const orderId = res.locals.order.id
  if (id && id !== orderId) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    })
  }
  return next()
}

function bodyHasStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status && !['delivered', 'invalid'].includes(status)) {
    return next();
  } else if (status === 'delivered') {
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  }
  next({
    status: 400,
    message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
  });
};

function bodyHasPendingStatus(req, res, next) {
  const { order: { status } = {} } = res.locals;
  if (status === 'pending') {
    return next();
  }
  next({
    status: 400,
    message: 'An order cannot be deleted unless it is pending'
  })
}
// function bodyHasCorrectStatus(req, res, next) {
//   const { data: { status } = {} } = req.body;
//   if (status !== 'delivered') {
//     return next();
//   }
//   next({
//     status: 400,
//     message: "A delivered order cannot be changed",
//   });
// };

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newId = new nextId();
  const newOrder = {
    id: newId,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

function read(req, res) {
  res.json({ data: res.locals.order });
};

function update(req, res, next) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  if (order.deliverTo !== deliverTo) {
    order.deliverTo = deliverTo;
  } if (order.mobileNumber !== mobileNumber) {
    order.mobileNumber = mobileNumber;
  }  if (order.status !== status) {
    order.status = status;
  }  if (order.dishes !== dishes) {
    order.dishes = dishes;
  }
  res.json({ data: order });
};

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  const deletedOrders = orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    bodyHasDeliverTo,
    bodyHasMobileNumber,
    bodyHasDishes,
    bodyHasDishesArray,
    bodyHasQuantity,
    create
  ],
  read: [orderExists, read],
  update: [    
    orderExists,
    bodyHasDeliverTo,
    bodyHasMobileNumber,
    bodyHasDishes,
    bodyHasDishesArray,
    bodyHasQuantity,
    orderId,
    bodyHasStatus,
    update,
  ],
  delete: [
    orderExists,
    bodyHasPendingStatus,
    destroy
  ],
}