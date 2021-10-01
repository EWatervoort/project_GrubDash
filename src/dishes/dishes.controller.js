const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
}

function dishId(req, res, next) {
  const { data: { id } = {} } = req.body;
  const dishId = res.locals.dish.id;
  if (id && id !== dishId) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  return next();
}

function bodyHasName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name) {
    res.locals.name = name;
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a name",
  });
}

function bodyHasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) {
    res.locals.description = description;
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a description",
  });
}

function bodyHasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price) {
    res.locals.price = price;
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a price",
  });
}

function thePriceIsRight(req, res, next) {
  const price = res.locals.price;
  if (price <= 0 || !Number.isInteger(price)) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  return next();
}

function bodyHasImageUrl(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
    res.locals.image_url = image_url;
    return next();
  }
  next({
    status: 400,
    message: "Dish must include a image_url",
  });
}

function create(req, res) {
  const newId = new nextId();
  const newDish = {
    id: newId,
    name: res.locals.name,
    description: res.locals.description,
    price: res.locals.price,
    image_url: res.locals.image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function list(req, res) {
  res.json({ data: dishes });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function update(req, res, next) {
  const dish = res.locals.dish;
  const originalName = dish.name;
  const originalDescription = dish.description;
  const originalPrice = dish.price;
  const originalImage_url = dish.image_url;
  if (originalName !== res.locals.name) {
    dish.name = res.locals.name;
  }
  if (originalDescription !== res.locals.description) {
    dish.description = res.locals.description;
  }
  if (originalPrice !== res.locals.price) {
    dish.price = res.locals.price;
  }
  if (originalImage_url !== res.locals.image_url) {
    dish.image_url = res.locals.image_url;
  }
  res.json({ data: dish });
}

module.exports = {
  list,
  create: [
    bodyHasName,
    bodyHasDescription,
    bodyHasPrice,
    thePriceIsRight,
    bodyHasImageUrl,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    bodyHasName,
    bodyHasDescription,
    bodyHasPrice,
    thePriceIsRight,
    bodyHasImageUrl,
    dishId,
    update,
  ],
};
