import themes from './themes';
import {
  generateTeam, genPosLeft, genPosRight, characterGenerator,
} from './generators';
import PositionedCharacter from './PositionedCharacter';
// import Character from './Character';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
// import Team from './Team';
import GameState from './GameState';
import cursors from './cursors';


export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gameState = new GameState();
    this.playerTypes = [Bowman, Swordsman, Magician];
    this.enemyTypes = [Vampire, Undead, Daemon];
    this.currentCellIdx = null;
  }

  init() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.drawUi(themes.prairie);
    this.start();
  }
  
  start() {
    this.createTeams();
    this.drawBoard();
  }

  onCellClick(index) {
    // TODO: react to mouse enter
  }

  onCellEnter(index) {
    if (typeof this.currentCellIdx === 'number' && !this.gamePlay.cells[this.currentCellIdx].classList.contains('selected-yellow')) {
      this.gamePlay.deselectCell(this.currentCellIdx);
    }
    const currentCell = this.gamePlay.cells[index];
    const currentCellWithChar = currentCell.firstChild;
    let isEnemy;
    let isAvailableToMove;
    let isAvailableToAttack;

    // показать инфу (есть персонаж в клетке)
    if (currentCellWithChar) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.showCellTooltip(getInfo(this.findCharacter(index)), index);
      isEnemy = this.gameState.enemyTypes.some((item) => currentCellWithChar.classList.contains(item));
    }

    if (this.gameState.selectedCell) {
      isAvailableToMove = this.availableTo(index, this.gameState.selectedCellCoordinates, this.gameState.selectedCharacter.moveDist);
      isAvailableToAttack = this.availableTo(index, this.gameState.selectedCellCoordinates, this.gameState.selectedCharacter.attackDist);
    }

    // если есть выделенная клетка
    if (this.gameState.selectedCell) {
      // если наведенная клетка в зоне хода
      if (isAvailableToMove) {
        // если наведенная клетка пустая
        if (!currentCellWithChar) {
          this.gamePlay.setCursor(cursors.pointer);
          this.gamePlay.selectCell(index, 'green');
        }
      // если наведенная клетка НЕ в зоне хода
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }

      // если в клетке персонаж противника
      if (currentCellWithChar && isEnemy) {
        // если в зоне атаки
        if (isAvailableToAttack) {
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }

    // если в наведенной клетке есть персонаж и он свой
    if (currentCellWithChar && !isEnemy) {
      this.gamePlay.setCursor(cursors.pointer);
    }

    this.currentCellIdx = index;
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }

  createTeams() {
    if (this.gameState.level === 1) {
      this.gameState.playerTeam = generateTeam(this.playerTypes, this.gameState.level, this.gameState.charactersCount);
      this.gameState.enemyTeam = generateTeam(this.enemyTypes, this.gameState.level, this.gameState.charactersCount);
    } else {
      const countForPlayer = this.numberOfCharactersToAdd(this.gameState.playerTeam.characters);
      const countForEnemy = this.numberOfCharactersToAdd(this.gameState.enemyTeam.characters);
      const playerChars = [];
      const enemyChars = [];
      for (let i = 1; i <= countForPlayer; i += 1) {
        playerChars.push(characterGenerator(this.playerTypes, this.gameState.level).next().value);
      }
      for (let i = 1; i <= countForEnemy; i += 1) {
        enemyChars.push(characterGenerator(this.enemyTypes, this.gameState.level).next().value);
      }
      playerChars.forEach((item) => this.gameState.playerTeam.characters.push(item));
      enemyChars.forEach((item) => this.gameState.enemyTeam.characters.push(item));
    }
    const posLeft = genPosLeft(this.gameState.charactersCount);
    const posRight = genPosRight(this.gameState.charactersCount);
    this.gameState.playerTeam.characters.forEach((item) => {
      this.gameState.positions.push(new PositionedCharacter(item, posLeft.next().value));
    });
    this.gameState.enemyTeam.characters.forEach((item) => {
      this.gameState.positions.push(new PositionedCharacter(item, posRight.next().value));
    });
  }

  drawBoard() {
    // this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions(this.gameState.positions);
  }
}
