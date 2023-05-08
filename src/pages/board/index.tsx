import Head from "next/head";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import styles from "./styles.module.scss";
import { FiPlus, FiCalendar, FiEdit2, FiTrash, FiClock } from "react-icons/fi";
import { SupportButton } from "@/components/SupportButton";
import { redirect } from "next/dist/server/api-utils";

export default function Board() {
  return (
    <>
      <Head>
        <title>Minhas tarefas - Board</title>
      </Head>
      <main className={styles.container}>
        <form>
          <input type="text" placeholder="Digite sua tarefa..." />
          <button type="submit">
            <FiPlus size={25} color="#17181f" />
          </button>
        </form>

        <h1>Você tem duas tarefas!</h1>

        <section>
          <article className={styles.taskList}>
            <p>
              Aprender criar projetos usando Next JS e aplicando firebase como
              back.
            </p>

            <div className={styles.actions}>
              <div>
                <div>
                  <FiCalendar size={20} color="#FFB800" />
                  <time>06 Maio 2023</time>
                </div>

                <button>
                  <FiEdit2 size={20} color="#FFF" />
                  <span>Editar</span>
                </button>
              </div>

              <button>
                <FiTrash size={20} color="#FF3636" />
                <span>Excluir</span>
              </button>
            </div>
          </article>
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
  console.log(session, 'aaa')
  if(!session?.id) {
    return{
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  console.log(session.user)

  return {
    props: {},
  };
};
