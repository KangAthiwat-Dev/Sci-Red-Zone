import type {
  ObjectiveConfig,
  ObjectiveEventId,
} from "./objectiveTypes";

export const OBJECTIVE_EVENTS = {
  MOVE_LEFT: "move-left",
  MOVE_RIGHT: "move-right",
  JUMP: "jump",
  CROUCH_OR_SLIDE: "crouch-or-slide",
  CRATE_PLACED: "crate-placed",
  CLIMB_COMPLETE: "climb-complete",
  FACULTY_HALL_EXIT: "faculty-hall-exit",

  STAIRWAY_DOOR_INSPECTED:
    "stairway-door-inspected",
  WIRE_PUZZLE_COMPLETED:
    "wire-puzzle-completed",
  KEYCARD_REQUESTED:
    "keycard-requested",
  KEYCARD_COLLECTED:
    "keycard-collected",
  STAIRWAY_EXIT: "stairway-exit",

  DNA_COMPLETED: "dna-completed",
  CELL_COMPLETED: "cell-completed",
  CHEMICAL_COMPLETED:
    "chemical-completed",
  ANTIDOTE_COLLECTED:
    "antidote-collected",
  LAB_EXIT: "lab-exit",

  ESCAPE_CONSOLE_COMPLETED:
    "escape-console-completed",
  ESCAPE_CHASE_STARTED:
    "escape-chase-started",
  ESCAPE_EXIT: "escape-exit",
} as const satisfies Record<
  string,
  ObjectiveEventId
>;

export const OBJECTIVES: ObjectiveConfig = {
  "faculty-hall": [
    {
      id: "learn-movement",
      title: "เรียนรู้การเคลื่อนที่",
      hint: "กด A / D หรือปุ่มลูกศรซ้ายขวาเพื่อเดินทั้งสองทิศ",
      completeWhen: [
        OBJECTIVE_EVENTS.MOVE_LEFT,
        OBJECTIVE_EVENTS.MOVE_RIGHT,
      ],
    },
    {
      id: "learn-jump",
      title: "ฝึกกระโดด",
      hint: "กด Space เพื่อกระโดดข้ามสิ่งกีดขวาง",
      completeWhen: [
        OBJECTIVE_EVENTS.JUMP,
      ],
    },
    {
      id: "learn-crouch-slide",
      title: "ฝึกย่อหรือสไลด์",
      hint: "กด C / Ctrl เพื่อย่อ หรือกดขณะวิ่งเพื่อสไลด์",
      completeWhen: [
        OBJECTIVE_EVENTS.CROUCH_OR_SLIDE,
      ],
      completionMode: "any",
    },
    {
      id: "push-crate",
      title: "ดันกล่องออกจากทาง",
      hint: "เข้าใกล้กล่อง กด E เพื่อจับ แล้วดันไปทางขวาจนเข้าตำแหน่ง",
      completeWhen: [
        OBJECTIVE_EVENTS.CRATE_PLACED,
      ],
    },
    {
      id: "learn-climb",
      title: "ปีนขึ้นไปต่อ",
      hint: "กระโดดเกาะขอบ แล้วกด Space หรือ W เพื่อปีนขึ้น",
      completeWhen: [
        OBJECTIVE_EVENTS.CLIMB_COMPLETE,
      ],
    },
    {
      id: "go-stairway",
      title: "ไปที่บันได",
      hint: "เดินไปทางขวาสุดเพื่อออกจากโถงและขึ้นบันได",
      completeWhen: [
        OBJECTIVE_EVENTS.FACULTY_HALL_EXIT,
      ],
    },
  ],

  stairway: [
    {
      id: "inspect-lab-door",
      title: "ตรวจสอบประตู Lab",
      hint: "ไปที่ประตูทางเข้า Lab เพื่อดูว่าระบบขัดข้องตรงไหน",
      completeWhen: [
        OBJECTIVE_EVENTS.STAIRWAY_DOOR_INSPECTED,
      ],
    },
    {
      id: "fix-wire-panel",
      title: "ต่อสายไฟ",
      hint: "ไปที่แผงควบคุมไฟฟ้าบริเวณตู้ล็อกเกอร์แล้วแก้ puzzle ให้ไฟกลับมา",
      completeWhen: [
        OBJECTIVE_EVENTS.WIRE_PUZZLE_COMPLETED,
      ],
    },
    {
      id: "return-lab-door",
      title: "กลับไปที่ประตู Lab",
      hint: "ตรวจประตูอีกครั้งหลังไฟกลับมาเพื่อดูว่าต้องใช้อะไรเพิ่ม",
      completeWhen: [
        OBJECTIVE_EVENTS.KEYCARD_REQUESTED,
      ],
    },
    {
      id: "collect-keycard",
      title: "เก็บ Keycard",
      hint: "ค้นหา Keycard บริเวณตู้ล็อกเกอร์ แล้วกด E เพื่อเก็บ",
      completeWhen: [
        OBJECTIVE_EVENTS.KEYCARD_COLLECTED,
      ],
    },
    {
      id: "enter-lab",
      title: "เข้า Lab",
      hint: "กลับไปที่ประตู Lab แล้วกดค้างเพื่อเปิดทางเข้า",
      completeWhen: [
        OBJECTIVE_EVENTS.STAIRWAY_EXIT,
      ],
    },
  ],

  laboratory: [
    {
      id: "dna-puzzle",
      title: "เก็บข้อมูล DNA",
      hint: "ใช้ console DNA แล้วจับคู่สายพันธุกรรมให้ครบ",
      completeWhen: [
        OBJECTIVE_EVENTS.DNA_COMPLETED,
      ],
    },
    {
      id: "cell-puzzle",
      title: "ตรวจหาเซลล์ผิดปกติ",
      hint: "ใช้เครื่องสแกนเซลล์และระบุเซลล์ที่ติดเชื้อ",
      completeWhen: [
        OBJECTIVE_EVENTS.CELL_COMPLETED,
      ],
    },
    {
      id: "chemical-puzzle",
      title: "ผสมสูตรเคมี",
      hint: "ใช้โต๊ะเคมีเพื่อผสมสูตรที่ต้องใช้กับสารต้านเชื้อ",
      completeWhen: [
        OBJECTIVE_EVENTS.CHEMICAL_COMPLETED,
      ],
    },
    {
      id: "collect-antidote",
      title: "สังเคราะห์ Antidote",
      hint: "ไปที่เครื่องสังเคราะห์แล้วกดค้างจนได้สารต้านเชื้อ",
      completeWhen: [
        OBJECTIVE_EVENTS.ANTIDOTE_COLLECTED,
      ],
    },
    {
      id: "leave-lab",
      title: "ออกจาก Lab",
      hint: "ไปที่ทางออกเพื่อเข้าสู่ห้องควบคุม",
      completeWhen: [
        OBJECTIVE_EVENTS.LAB_EXIT,
      ],
    },
  ],

  escape: [
    {
      id: "activate-escape-console",
      title: "เปิดระบบควบคุมเชื้อ",
      hint: "ไปที่เครื่องควบคุมแล้วกด E ค้างเพื่อลดจำนวนผู้ติดเชื้อ",
      completeWhen: [
        OBJECTIVE_EVENTS.ESCAPE_CONSOLE_COMPLETED,
      ],
    },
    {
      id: "wait-for-chase",
      title: "เตรียมวิ่งหนี",
      hint: "พบผู้ติดเชื้อกลายพันธุ์เตรียมหนี",
      completeWhen: [
        OBJECTIVE_EVENTS.ESCAPE_CHASE_STARTED,
      ],
    },
    {
      id: "escape-mutant",
      title: "วิ่งหนีตัวกลายพันธุ์",
      hint: "วิ่งไปทางขวาให้ถึงทางออกก่อนถูกไล่ทัน",
      completeWhen: [
        OBJECTIVE_EVENTS.ESCAPE_EXIT,
      ],
    },
  ],
};
