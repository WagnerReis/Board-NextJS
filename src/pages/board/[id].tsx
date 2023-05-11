import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import firebase from "../../services/firebaseConnection";
import { format } from "date-fns";

type Task = {
  id: string;
  created: string | Date;
  createdFormated?: string;
  tarefa: string;
  userId: string;
  nome: string;
}

interface TaskListProps {
  data: string;
}

export default function Task({ data }: TaskListProps) {
  const task: Task = JSON.parse(data);

  return (
    <div>
      <h1>Pagina detalhes</h1>
      <h2>{task.tarefa}</h2>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const { id } = params;
  const session = await getSession({ req });

  const data = await firebase.firestore().collection('tarefas')
  .doc(String(id))
  .get()
  .then((snapshot) => {
    const data = {
      id: snapshot.id,
      created: snapshot.data()?.created,
      createdFormated: format(snapshot.data()?.created.toDate(), 'dd MMMM yyyy'),
      tarefa: snapshot.data()?.tarefa,
      userId: snapshot.data()?.userId,
      nome: snapshot.data()?.nome
    }

    return JSON.stringify(data)
  })

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
      data
    },
  };
};
