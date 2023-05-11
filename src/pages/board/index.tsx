import { FormEvent, useState } from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import styles from "./styles.module.scss";
import {
  FiPlus,
  FiCalendar,
  FiEdit2,
  FiTrash,
  FiClock,
  FiX,
} from "react-icons/fi";
import { SupportButton } from "@/components/SupportButton";
import { format } from "date-fns";

import firebase from "../../services/firebaseConnection";
import Link from "next/link";

type TaskList = {
  id: string;
  created: string | Date;
  createdFormat: string;
  tarefa: string;
  userId: string;
  nome: string;
};

interface BoardProps {
  user: {
    id: string;
    nome: string;
  };
  data: string;
}

export default function Board({ user, data }: BoardProps) {
  const [input, setInput] = useState("");
  const [taskList, setTaskList] = useState<TaskList[]>(JSON.parse(data));

  const [taskEdit, setTaskEdit] = useState<TaskList | null>(null);

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();

    if (input === "") {
      alert("Preenche alguma tarefa!");
      return;
    }

    if (taskEdit) {
      await firebase
        .firestore()
        .collection("tarefas")
        .doc(taskEdit.id)
        .update({
          tarefa: input,
        })
        .then(() => {
          let data = taskList;
          let taskIndex = data.findIndex(task => task.id === taskEdit.id);

          taskList[taskIndex].tarefa = input;
          setTaskList(data);
          handleCancelEdit();
        })
        .catch((err) => {
          console.log(err);
        });

      return;
    }

    await firebase
      .firestore()
      .collection("tarefas")
      .add({
        created: new Date(),
        tarefa: input,
        userId: user.id,
        nome: user.nome,
      })
      .then((doc) => {
        console.log("CADASTRADO COM SUCESSO");
        let data = {
          id: doc.id,
          created: new Date(),
          createdFormat: format(new Date(), "dd MMMM yyyy"),
          tarefa: input,
          userId: user.id,
          nome: user.nome,
        };

        setTaskList([data, ...taskList]);
        setInput("");
      })
      .catch((err) => {
        console.log("ERRO AO CADASTRAR: ", err);
      });
  }

  async function handleDelete(id: string) {
    await firebase
      .firestore()
      .collection("tarefas")
      .doc(id)
      .delete()
      .then(() => {
        console.log("Deletado com sucesso");
        const newTasks = taskList.filter((task) => task.id !== id);
        setTaskList(newTasks);
      })
      .catch((err) => {
        console.log(err, "Erro ao deletar");
      });
  }

  function handleEditTask(task: TaskList) {
    setTaskEdit(task);
    setInput(task.tarefa);
  }

  function handleCancelEdit() {
    setInput("");
    setTaskEdit(null);
  }

  return (
    <>
      <Head>
        <title>Minhas tarefas - Board</title>
      </Head>
      <main className={styles.container}>
        {taskEdit && (
          <span className={styles.warnText}>
            <button onClick={() => handleCancelEdit()}>
              <FiX size={30} color="#FF3636" />
            </button>
            Você está editando uma tarefa
          </span>
        )}

        <form onSubmit={handleAddTask}>
          <input
            type="text"
            placeholder="Digite sua tarefa..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">
            <FiPlus size={25} color="#17181f" />
          </button>
        </form>

        <h1>
          Você tem {taskList.length}{" "}
          {taskList.length === 1 ? "tarefa" : "tarefas"}!
        </h1>

        <section>
          {taskList.map((task) => (
            <article key={task.id} className={styles.taskList}>
              <Link href={`/board/${task.id}`}>
                <p>{task.tarefa}</p>
              </Link>
              <div className={styles.actions}>
                <div>
                  <div>
                    <FiCalendar size={20} color="#FFB800" />
                    <time>{task.createdFormat}</time>
                  </div>

                  <button onClick={() => handleEditTask(task)}>
                    <FiEdit2 size={20} color="#FFF" />
                    <span>Editar</span>
                  </button>
                </div>

                <button onClick={() => handleDelete(task.id)}>
                  <FiTrash size={20} color="#FF3636" />
                  <span>Excluir</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      <div className={styles.vipContainer}>
        <h3>Obrigado por apoiar esse projeto!</h3>
        <div>
          <FiClock size={28} color="#FFF" />
          <time>Última doação foi a 3 dias.</time>
        </div>
      </div>

      <SupportButton />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  if (!session?.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const tasks = await firebase
    .firestore()
    .collection("tarefas")
    .where("userId", "==", session?.id)
    .orderBy("created", "desc")
    .get();

  const data = JSON.stringify(
    tasks.docs.map((task) => {
      return {
        id: task.id,
        createdFormat: format(task.data().created.toDate(), "dd MMMM yyyy"),
        ...task.data(),
      };
    })
  );

  const user = {
    nome: session?.user?.name,
    id: session?.id,
  };

  return {
    props: {
      user,
      data,
    },
  };
};
