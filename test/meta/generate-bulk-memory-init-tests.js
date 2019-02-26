// TODO: inline in caller if it is only used one place

function gen_mem_mod_t(insn) {
    print(
`
(module
  (memory (export "memory0") 1 1)
  (data (i32.const 2) "\\03\\01\\04\\01")
  (data passive "\\02\\07\\01\\08")
  (data (i32.const 12) "\\07\\05\\02\\03\\06")
  (data passive "\\05\\09\\02\\07\\06")
  (func (export "testfn")
    ${insn})
  (func (export "load8_u") (param i32) (result i32)
    (i32.load8_u (local.get 0)))
)
`);
};

function mem_test(instruction, expected_result_vector) {
    gen_mem_mod_t(instruction);
    print(`(invoke "testfn")`);
    for (let i = 0; i < expected_result_vector.length; i++) {
        print(`(assert_return (invoke "load8_u" (i32.const ${i})) (i32.const ${expected_result_vector[i]}))`);
    }
}

const e = 0;

// This just gives the initial state of the memory, with its active
// initialisers applied.
mem_test("nop",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Passive init that overwrites all-zero entries
mem_test("(memory.init 1 (i32.const 7) (i32.const 0) (i32.const 4))",
         [e,e,3,1,4, 1,e,2,7,1, 8,e,7,5,2, 3,6,e,e,e, e,e,e,e,e, e,e,e,e,e]);

// Passive init that overwrites existing active-init-created entries
mem_test("(memory.init 3 (i32.const 15) (i32.const 1) (i32.const 3))",
         [e,e,3,1,4, 1,e,e,e,e, e,e,7,5,2, 9,2,7,e,e, e,e,e,e,e, e,e,e,e,e]);
