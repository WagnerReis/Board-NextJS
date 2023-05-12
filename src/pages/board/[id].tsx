import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import firebase from "../../services/firebaseConnection";
import { format } from "date-fns";

import styles from "./task.module.scss";
import { FiCalendar } from "react-icons/fi";
import Head from "next/head";

type TaskType = {
  id: string;
  created: string | Date;
  createdFormated?: string;
  tarefa: string;
  userId: string;
  nome: string;
};

interface TaskListProps {
  data: string;
}

export default function Task({ data }: TaskListProps) {
  const task: TaskType = JSON.parse(data);

  return (
    <main className={styles.container}>
      <Head>
        <title>Detalhes da sua tarefa</title>
      </Head>
      <article className={styles.container}>
        <div className={styles.actions}>
          <div>
            <FiCalendar size={20} color="#FFB800" />
            <span>Tarefa criada: </span>
            <time>{task.createdFormated}</time>
          </div>
        </div>
        <p>{task.tarefa}</p>
      </article>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const { id } = params;
  const session = await getSession({ req });

  const data = await firebase
    .firestore()
    .collection("tarefas")
    .doc(String(id))
    .get()
    .then((snapshot) => {
      const data = {
        id: snapshot.id,
        created: snapshot.data()?.created,
        createdFormated: format(
          snapshot.data()?.created.toDate(),
          "dd MMMM yyyy"
        ),
        tarefa: snapshot.data()?.tarefa,
        userId: snapshot.data()?.userId,
        nome: snapshot.data()?.nome,
      };

      return JSON.stringify(data);
    });

  if (!session?.id) {
    return {
      redirect: {
        destination: "/board",
        permanent: false,
      },
    };
  }

  return {
    props: {
      data,
    },
  };
};
