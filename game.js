/*
 * @Author: kasora 
 * @Date: 2017-09-28 20:46:42 
 * @Last Modified by: kasora
 * @Last Modified time: 2017-10-09 16:37:39
 */
'use strict';

let config = {
  size: 10,
  tick: 100,
  heightBlocks: 'loading',
  widthBlocks: 'loading',
  aliveMax: 3,
  aliveMin: 2,
  alpha: 0.4,
  background: [255, 255, 255, 1],
  // background: [54, 54, 54, 1], // rgba or rgb
  createRate: 0.08,
  mode: 'random', // String 'random' or rgba(or rgb) Array
  // mode: [131, 139, 139]
  autoRestart: true
};

function getColor() {
  return [Math.random() * 255, Math.random() * 255, Math.random() * 255, config.alpha]
}

function init(canvas) {
  config.heightBlocks = parseInt(document.body.clientHeight / config.size) + 1;
  config.widthBlocks = parseInt(document.body.clientWidth / config.size) + 1;
  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;

  if (config.background.length === 3) {
    config.background.push(config.alpha);
  }
  if (Array.isArray(config.mode) && config.mode.length === 3) {
    config.mode.push(config.alpha);
  }

  let data = [];

  for (let i = 0; i < config.heightBlocks; i++) {
    let tempRow = [];
    for (let j = 0; j < config.widthBlocks; j++) {
      tempRow.push(Math.random() < config.createRate ?
        Array.isArray(config.mode) ? config.mode : getColor() :
        config.background
      )
      // tempRow.push(config.background);
    }
    data.push(tempRow);
  }
  data[1][1] = [125, 125, 125, 0.5];
  data[1][3] = [125, 125, 125, 0.5];

  let dataList = [];
  dataList.push(data);
  dataList.push(getNextTick(getList(data)));
  return dataList;
}

function draw(canvas, data) {
  let ctx = canvas.getContext("2d")

  ctx.clearRect(0, 0, config.widthBlocks * config.size, config.heightBlocks * config.size);
  if (canvas.getContext) {
    for (let i = 0; i < config.heightBlocks; i++) {
      for (let j = 0; j < config.widthBlocks; j++) {
        let alpha = data[i][j][3];
        let intrgba = data[i][j].map(item => parseInt(item));
        intrgba[3] = alpha;
        ctx.fillStyle = `rgba(${intrgba.join(',')})`
        ctx.fillRect(j * config.size, i * config.size, config.size, config.size);
      }
    }
  }
}

function isEmpty(block) {
  for (let i = 0; i < block.length; i++) {
    if (block[i] !== config.background[i]) {
      return false;
    }
  }
  return true;
}

function isDead(blockData1, blockData2) {
  for (let i = 0; i < config.heightBlocks; i++) {
    for (let j = 0; j < config.widthBlocks; j++) {
      if (isEmpty(blockData1[i][j]) !== isEmpty(blockData2[i][j])) {
        return false;
      }
    }
  }
  return true;
}

function getList(data) {
  let blockList = [];
  for (let i = 0; i < config.heightBlocks; i++) {
    for (let j = 0; j < config.widthBlocks; j++) {
      if (!isEmpty(data[i][j])) {
        blockList.push({
          row: i,
          col: j,
          color: data[i][j]
        })
      }
    }
  }

  return blockList;
}

function createData(blockList) {
  let data = [];
  for (let i = 0; i < config.heightBlocks; i++) {
    data.push(new Array(config.widthBlocks).fill(config.background));
  }

  for (let blockInfo of blockList) {
    data[blockInfo.row][blockInfo.col] = blockInfo.color;
  }

  return data;
}

function getNextTick(blockList) {
  let dataCount = [];
  let data = [];
  for (let i = 0; i < config.heightBlocks; i++) {
    dataCount.push(new Array(config.widthBlocks).fill(0));
    data.push(new Array(config.widthBlocks).fill(config.background));
  }
  for (let blockInfo of blockList) {
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        let row = (config.heightBlocks - 1 + blockInfo.row + i) % (config.heightBlocks - 1);
        let col = (config.widthBlocks - 1 + blockInfo.col + j) % (config.widthBlocks - 1);
        dataCount[row][col]++;
      }
    }
  }

  for (let block of blockList) {
    if (dataCount[block.row][block.col] >= config.aliveMin && dataCount[block.row][block.col] <= config.aliveMax) {
      data[block.row][block.col] = block.color;
    }
  }
  for (let i = 0; i < config.heightBlocks; i++) {
    for (let j = 0; j < config.widthBlocks; j++) {
      if (dataCount[i][j] === config.aliveMax && isEmpty(data[i][j])) {
        data[i][j] = Array.isArray(config.mode) ? config.mode : getColor()
      }
    }
  }

  return data;
}

function startGame() {
  let canvas = document.getElementById("game");
  let dataList = init(canvas);
  setInterval(function () {
    draw(canvas, dataList[1]);
    dataList.push(getNextTick(getList(dataList[1])));
    let preData = dataList.shift();
    if (config.autoRestart && isDead(dataList[1], preData)) {
      dataList = init(canvas);
    }
  }, config.tick);
}